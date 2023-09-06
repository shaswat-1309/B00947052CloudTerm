import boto3
import os

sns_topic_arn = os.environ.get('SNS_TOPIC_ARN')
sns = boto3.client('sns')

def lambda_handler(event, context):
    # Validate the order and extract the email address and message from the event
    email_address = event.get('email')
    message = event.get('message')

    if not email_address or not message:
        return {
            'status': 400,
            'body': 'Invalid input format. Both "email" and "message" fields are required.'
        }

    # Send the notification to the SNS topic
    try:
        response = sns.publish(
            TopicArn=sns_topic_arn,
            Message=message,
            Subject='Order Notification'
        )
        print('Notification sent successfully:', message)
        return {
            'status': 200,
            'body': 'Order placed successfully.'
        }
    except Exception as e:
        print('Error sending notification:', str(e))
        return {
            'status': 500,
            'body': 'Error sending notification.'
        }
