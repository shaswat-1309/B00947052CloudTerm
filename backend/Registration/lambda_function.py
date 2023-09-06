import json
import boto3
import hashlib
import os

def register_user_in_cognito(given_name, email, password):
    
    user_pool_id = os.environ.get('USER_POOL_ID')
    client_id = os.environ.get('APP_CLIENT_ID')

    client = boto3.client('cognito-idp')

    # Hash the user's password using SHA256
    password_hash = hashlib.sha256(password.encode()).hexdigest()

    try:
        response = client.sign_up(
            ClientId=client_id,  # Replace with your Cognito App Client ID
            Username=email,
            Password=password_hash,
            UserAttributes=[
                {
                    'Name': 'email',
                    'Value': email
                },
                {
                    'Name': 'given_name',
                    'Value': given_name
                },

                # Add more user attributes as needed
            ]
        )
        return True, response
    except client.exceptions.UsernameExistsException:
        return False, 'User with this email already exists'
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

    # Validate that all required fields are present
    if not (given_name and email and age and password):
        return {
            'status': 400,  # Bad Request status code
            'message': 'Missing required fields: given_name, email, age, password'
        }

    # Register the user in AWS Cognito
    success, response = register_user_in_cognito(given_name, email, password)
    if not success:
        return {
            'status': 500,  # Bad Request status code
            'message': response
        }

    # Return the message asking the user to enter the verification code
    return {
        'status': 200,  # Created status code
        'message': 'User registered successfully. Please enter the verification code you received in your email.'
    }
