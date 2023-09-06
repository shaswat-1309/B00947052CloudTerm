import json
import boto3
import os

def logout_user_in_cognito(token):
    # Replace 'your-user-pool-id' with your AWS Cognito User Pool ID
    user_pool_id = os.environ.get('USER_POOL_ID')

    client = boto3.client('cognito-idp')

    try:
        response = client.global_sign_out(
            AccessToken=token
        )
        return True, 'User successfully signed out'
    except client.exceptions.NotAuthorizedException:
        return False, 'Invalid token'
    except Exception as e:
        return False, str(e)

def lambda_handler(event, context):
    # Parse the request body
    request_body = event['body']

    # Extract the access token from the request body
    access_token = request_body.get('AccessToken')

    # Validate that the access token is present
    if not access_token:
        return {
            'status': 400,  # Bad Request status code
            'message': 'AccessToken missing in request body'
        }

    # Log out the user from AWS Cognito
    success, message = logout_user_in_cognito(access_token)
    if not success:
        return {
            'status': 400,  # Bad Request status code
            'message': message
        }

    # Return the successful logout response
    return {
        'status': 200,
        'message': message
    }

