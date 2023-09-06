import boto3

def lambda_handler(event, context):

    request_body = event

    # Extract user details from the request body
    s3_bucket = request_body.get('bucket_name')
    s3_object_key = request_body.get('image_name')

    textract_client = boto3.client('textract', region_name='us-east-1')

    # Call Textract to extract text from the image/document
    response = textract_client.detect_document_text(
        Document={
            'S3Object': {
                'Bucket': s3_bucket,
                'Name': s3_object_key
            }
        }
    )

    # Extract the raw text from the Textract response
    raw_text = ""
    for item in response['Blocks']:
        if item['BlockType'] == 'LINE':
            raw_text += item['Text'] + '\n'

    # Process the raw text to split it into product and quantity
    result = []
    for entry in raw_text.split('\n'):
        words = entry.split()
        if len(words) == 2 and words[1].isdigit():
            product, quantity = words[0], int(words[1])
            result.append({'product': product, 'quantity': quantity})

    # Return the response
    return result
