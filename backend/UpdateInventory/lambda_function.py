import boto3
import json
import os


lambda_function_name = os.environ.get('SNS_LAMBDA_FUNCTION_NAME')
dynamodb_table_name = os.environ.get('DYNAMODB_TABLE_NAME')

def invoke_SNSEmail_lambda(user_email, message):
    lambda_client = boto3.client('lambda')

    # Prepare the payload to be passed to the invoked Lambda function
    payload = {
        'email': user_email,
        'message': message
    }

    # Invoke the Lambda function
    response = lambda_client.invoke(
        FunctionName=lambda_function_name,
        InvocationType='Event',  # Use 'Event' for asynchronous invocation
        Payload=json.dumps(payload)
    )

    # Optionally, you can handle the response from the invoked Lambda function here
    # For asynchronous invocation, the response will be minimal as it's for confirmation of the invocation

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(dynamodb_table_name)  # Replace 'inventory' with your actual DynamoDB table name

    # Extract the email and data from the event body
    event_body = event.get('body')
    user_email = event_body.get('email')
    data = event_body.get('data')

    if not user_email or not data:
        return {"errorMessage": "Invalid input format. 'email' and 'data' fields are required."}

    insufficient_products = []

    for product in data:
        product_name = product.get("product")
        quantity_needed = product.get("quantity")

        if not product_name or not quantity_needed:
            return {"errorMessage": "Invalid input format. Each product must have 'product' and 'quantity' fields."}

        response = table.get_item(Key={'product': product_name})
        if 'Item' not in response:
            insufficient_products.append(product_name)
        else:
            quantity_available = response['Item']['quantity']
            if quantity_available < quantity_needed:
                insufficient_products.append(product_name)

    if not insufficient_products:
        # All products have sufficient quantities, so update the DynamoDB table
        for product in data:
            product_name = product["product"]
            quantity_needed = product["quantity"]

            response = table.get_item(Key={'product': product_name})
            quantity_available = response['Item']['quantity']
            updated_quantity = quantity_available - quantity_needed

            if updated_quantity > 0:
                table.update_item(
                    Key={'product': product_name},
                    UpdateExpression='SET quantity = :val',
                    ExpressionAttributeValues={':val': updated_quantity}
                )
            else:
                table.delete_item(Key={'product': product_name})

        # Send a confirmation email to the user
        message = "Your order has been placed successfully."
        response = invoke_SNSEmail_lambda(user_email, message)

        # Return the email along with the success message
        return message
    else:
        # Combine insufficient products into a string and return
        insufficient_products_str = ", ".join(insufficient_products)

        message = f"Your order could not be placed due to insufficient quantities of the following products: {insufficient_products_str}."
        response = invoke_SNSEmail_lambda(user_email, message)
        # Return the email along with the failure message
        return message
