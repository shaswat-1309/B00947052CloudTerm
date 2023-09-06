import json
import boto3
import hashlib
import os


def authenticate_user_in_cognito(email, password):

    user_pool_id = os.environ.get('USER_POOL_ID')
    client_id = os.environ.get('APP_CLIENT_ID')

    client = boto3.client('cognito-idp')

    try:
        response = client.admin_initiate_auth(
            UserPoolId=user_pool_id,
            ClientId=client_id,
            AuthFlow='ADMIN_NO_SRP_AUTH',
            AuthParameters={
                'USERNAME': email,
                'PASSWORD': hashlib.sha256(password.encode()).hexdigest()
            }
        )
        return True, response['AuthenticationResult']['AccessToken']
    except client.exceptions.UserNotFoundException:
        return False, 'User with this email does not exist', 401
    except client.exceptions.NotAuthorizedException:
        return False, 'Invalid email or password', 402
    except Exception as e:
        return False, str(e)


def lambda_handler(event, context):
    # Parse the request body
    request_body = event['body']

    # Extract user details from the request body
    email = request_body.get('email')
    password = request_body.get('password')

    # Validate that email and password are present
    if not (email and password):
        return {
            'status': 400,  # Bad Request status code
            'message': 'Missing required fields: email, password'
        }

    # Authenticate the user with AWS Cognito
    success, access_token = authenticate_user_in_cognito(email, password)
    if not success:
        return {
            'status': 401,  # Unauthorized status code
            'AccessToken': access_token
        }

    # Return the successful authentication response with the access token
    return {
        'status': 200,
        'message': 'Login successful',
        'AccessToken': access_token
    }
