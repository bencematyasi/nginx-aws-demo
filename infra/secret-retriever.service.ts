
import * as fs from 'fs'
import * as aws from "@pulumi/aws";

//Retrieving secret from AWS SecretManager, otherwise throw error
async function getAwsSecretAsync(secretName: string) {
    try {
        const response = await aws.secretsmanager.getSecretVersion({ secretId: secretName });
        return response;
    } catch (error) {
        console.error('Error occurred while retrieving AWS secret');
        console.error(error);
        return null;
    }
}

//Writing the ServerAccess into a .htpasswd that docker build will use
function writeSecretIntoFile(secretObject: any) {
    if (secretObject) {
        const file = fs.createWriteStream("../app/.htpasswd");

        secretObject.forEach((element: any) => {
            file.write(`${element}\n`);
        });

        file.close();
    }
}

// Index.ts will call this method and pass the secretname
export async function getSecretAndWriteFile(secretName?: string) {
    if (secretName) {
        const secret = await getAwsSecretAsync(secretName);
        if (secret?.secretString) {
            var secretObject = JSON.parse(secret.secretString)["SERVERACCESS"].split(",");
            return writeSecretIntoFile(secretObject);
        }
    }
    return console.log("No secret name was defined");
}