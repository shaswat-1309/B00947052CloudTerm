import json
import boto3
import os

def verify_token_in_cognito(token):
    # Replace 'your-user-pool-id' with your AWS Cognito User Pool ID
    user_pool_id = os.environ.get('USER_POOL_ID')

    client = boto3.client('cognito-idp')

    try:
        response = client.get_user(
            AccessToken=token
        )
        # Extract the 'given_name' attribute from the response
        user_attributes = response['UserAttributes']
        given_name = next((attr['Value'] for attr in user_attributes if attr['Name'] == 'given_name'), None)

        return True, given_name
    except client.exceptions.NotAuthorizedException:
        return False, 'Invalid token'
    except Exception as e:
        return False, str(e)

def lambda_handler(event, context):
    # Parse the request body
    body = event['body']
    token = body['AccessToken']


    # Validate that the token is present
    if not token:
        return {
            'status': 400,  # Bad Request status code
            'message': 'Token missing in request body'
        }

    # Verify the token in AWS Cognito
    success, given_name = verify_token_in_cognito(token)
    if not success:
        return {
            'status': 401,  # Unauthorized status code
            'given_name': given_name
        }

    # Token verification successful, proceed with further logic here if needed
    return {
        'status': 200,
        'message': 'Token verification successful',
        'given_name': given_name
    }
