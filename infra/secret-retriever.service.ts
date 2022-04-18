
import * as fs from 'fs'
import * as aws from "@pulumi/aws";

function getAwsSecretValueFromClient(secretName: string) {
    return aws.secretsmanager.getSecretVersion({ secretId: secretName });
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
        if (secret?.secretString) {
            var secretObject = JSON.parse(secret.secretString)["SERVERACCESS"].split(",");
            writeSecretIntoFile(secretObject)
        }
    }
}