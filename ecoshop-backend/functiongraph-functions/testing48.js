exports.handler = async (event, context) => {
    const output =
    {
        'statusCode': 200,
        'headers':
        {
            'Content-Type': 'application/json'
        },
        'isBase64Encoded': false,
        'body': JSON.stringify({
            // a: context.getAccessKey(),
            // s: context.getSecretKey(),
        }),
    }
    return output;
}
