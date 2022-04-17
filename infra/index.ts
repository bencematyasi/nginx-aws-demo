import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as AWS from 'aws-sdk';
import secretService = require('./secret-retriever.service');

const stack = pulumi.getStack()


const EXPOSED_PORT = parseInt(process.env.EXPOSED_PORT as string);
console.log(EXPOSED_PORT)
const AWS_REGION = process.env.AWS_REGION
console.log(AWS_REGION)
const AWS_SERVER_ACCESS_SECRET_NAME = process.env.AWS_SERVER_ACCESS_SECRET_NAME
console.log(AWS_SERVER_ACCESS_SECRET_NAME)

//Creating ECS Cluster with name prefix os cluster.
const cluster = new awsx.ecs.Cluster("cluster", {})

//creating Application LoadBalancer that is exposed to the internet, single point of access.
const alb = new awsx.elasticloadbalancingv2.ApplicationLoadBalancer("app-lb", { external: true, securityGroups: cluster.securityGroups });

//creating TargetGroup for LoadBalancer and setting port and deregistrarion delay to 0s.
const atg = alb.createTargetGroup("app-tg", { port: EXPOSED_PORT, deregistrationDelay: 0 });

//Creating Listener for TargetGroup and setting port 
const web = atg.createListener("web", { port: EXPOSED_PORT });

//secretService.getSecretAndWriteFile();

const containerImage = awsx.ecs.Image.fromPath('app-img', '../app')

const appService = new awsx.ecs.FargateService('app-svc', {
    cluster,
    taskDefinitionArgs: {
        container: {
            image: containerImage,
            portMappings: [web]
        },
    },
    desiredCount: 1,
})

//secretService.removeFile();

export const url = pulumi.interpolate`${web.endpoint.hostname}`