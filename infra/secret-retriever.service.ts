
import * as AWS from 'aws-sdk'
import * as fs from 'fs'

const client = new AWS.SecretsManager({
    region: process.env.AWS_REGION,
});



function getAwsSecretValueFromClient(secretName: string) {
    return client.getSecretValue({ SecretId: secretName }).promise();
}

async function getAwsSecretAsync(secretName: string) {
    try {
        const response = await getAwsSecretValueFromClient(secretName);
        return response;
    } catch (error) {
        console.error('Error occurred while retrieving AWS secret');
        console.error(error);
        return null;
    }
}

function writeSecretIntoFile(secretObject: any) {
    if (secretObject) {
        const file = fs.createWriteStream("../app/.htpasswd")

        secretObject.forEach((element: any) => {
            file.write(`${element}\n`)
        });

        file.close()
    }
}

export async function getSecretAndWriteFile(secretName?: string) {
    if (secretName) {
        const secret = await getAwsSecretAsync(secretName);
        if (secret?.SecretString) {
            var secretObject = JSON.parse(secret.SecretString)["SERVERACCESS"].split(",");
            writeSecretIntoFile(secretObject)
        }
    }
}