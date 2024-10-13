const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

const s3Client = new S3Client({ region: "us-east-1" });
const dynamoClient = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const bedrockRuntime = new BedrockRuntimeClient({ region: "us-east-1" });

const bucketName = process.env.BUCKET_NAME;
const tableName = process.env.TABLE_NAME;

exports.generateImage = async (event) => {
  let params;
  try {
    console.log('Received event:', JSON.stringify(event, null, 2));
    const { prompt } = JSON.parse(event.body);
    console.log('Prompt:', prompt);

    const body = JSON.stringify({
      taskType: "TEXT_IMAGE",
      textToImageParams: {
        text: prompt,
      },
      imageGenerationConfig: {
        numberOfImages: 1,
        height: 512,
        width: 512,
        cfgScale: 8,
        seed: 0,
        quality: "standard"
      }
    });

    params = {
      body,
      modelId: "amazon.titan-image-generator-v2:0",
      accept: "application/json",
      contentType: "application/json"
    };

    console.log('Bedrock params:', JSON.stringify(params, null, 2));

    const command = new InvokeModelCommand(params);
    const response = await bedrockRuntime.send(command);

    console.log('Bedrock response:', JSON.stringify(response, null, 2));

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const base64Image = responseBody.images[0];

    const imageBuffer = Buffer.from(base64Image, 'base64');
    const key = `${Date.now()}.png`;
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: imageBuffer,
      ContentType: 'image/png'
    }));

    const item = {
      id: key,
      prompt: prompt,
      createdAt: Date.now()
    };
    await docClient.send(new PutCommand({
      TableName: tableName,
      Item: item
    }));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ message: 'Image generated and saved', imageUrl: `https://${bucketName}.s3.amazonaws.com/${key}` }),
    };
  } catch (error) {
    console.error('Error details:', JSON.stringify(error, null, 2));
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ 
        message: 'Error generating image', 
        error: error.message,
        stack: error.stack,
        details: JSON.stringify(error, null, 2),
        params: params ? JSON.stringify(params, null, 2) : 'Params not defined'
      }),
    };
  }
};

exports.searchImages = async (event) => {
  try {
    const { queryStringParameters } = event;
    const searchTerm = queryStringParameters ? queryStringParameters.term : '';

    const params = {
      TableName: tableName,
      FilterExpression: 'contains(prompt, :searchTerm)',
      ExpressionAttributeValues: {
        ':searchTerm': searchTerm
      }
    };

    const result = await docClient.send(new ScanCommand(params));

    const itemsWithImageUrls = result.Items.map(item => ({
      ...item,
      imageUrl: `https://${bucketName}.s3.amazonaws.com/${item.id}`
    }));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(itemsWithImageUrls),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ message: 'Error searching images' }),
    };
  }
};