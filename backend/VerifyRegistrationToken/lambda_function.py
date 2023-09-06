import json
import boto3
import hashlib
import os

dynamodb_table_name = os.environ.get('DYNAMODB_TABLE_NAME')
topic_arn = os.environ.get('SNS_TOPIC_ARN')

def verify_user_code_in_cognito(email, verification_code):
    # Replace 'your-user-pool-id' with your AWS Cognito User Pool ID
    user_pool_id = os.environ.get('USER_POOL_ID')
    client_id = os.environ.get('APP_CLIENT_ID')


    client = boto3.client('cognito-idp')

    try:
        response = client.confirm_sign_up(
            ClientId=client_id,  # Replace with your Cognito App Client ID
            Username=email,
            ConfirmationCode=verification_code
        )
        return True, response
    except client.exceptions.CodeMismatchException:
        return False, 'Invalid verification code'
    except Exception as e:
        return False, str(e)

def lambda_handler(event, context):
    # Parse the request body
    request_body = event['body']

    # Extract user details from the request body
    given_name = request_body.get('given_name')
    email = request_body.get('email')
    age = request_body.get('age')
    password = request_body.get('password')
    verification_code = request_body.get('verification_code')

    # Validate that all required fields are present
    if not (given_name and email and age and password and verification_code):
        return {
            'statusCode': 400,  # Bad Request status code
            'message': 'Missing required fields: given_name, email, age, password, verification_code'
        }

    # Verify the verification code in AWS Cognito
    success, response = verify_user_code_in_cognito(email, verification_code)

    snsobject = boto3.client('sns')
    snsobject.subscribe(TopicArn=topic_arn, Protocol="email", Endpoint=email)

    if not success:
        return {
            'status': 500,  # Bad Request status code
            'message': response
        }

    # Connect to DynamoDB
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(dynamodb_table_name)  # Replace 'users' with your DynamoDB table name

    # Check if a user with the given email already exists in the table
    response = table.get_item(Key={'email': email})

    # Hash the user's password using SHA256
    password_hash = hashlib.sha256(password.encode()).hexdigest()

    # Put the new user item in the table
    table.put_item(
        Item={
            'email': email,
            'given_name': given_name,
            'age': age,
            'password': password_hash
        }
    )

    return {
        'status': 200,  # Created status code
        'message': 'User registered successfully and verified'
    }
