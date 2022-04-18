import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
import secretService = require('./secret-retriever.service');

const stack = pulumi.getStack()


const EXPOSED_PORT = parseInt(process.env.AWS_EXPOSED_PORT as string) || 80;
const AWS_SERVER_ACCESS_SECRET_NAME = process.env.AWS_SERVER_ACCESS_SECRET_NAME

//Creating ECS Cluster with name prefix os cluster.
const cluster = new awsx.ecs.Cluster("cluster", {});

//creating Application LoadBalancer that is exposed to the internet, single point of access.
const alb = new awsx.elasticloadbalancingv2.ApplicationLoadBalancer("app-lb", { external: true, securityGroups: cluster.securityGroups });

//creating TargetGroup for LoadBalancer and setting port and deregistrarion delay to 0s.
const atg = alb.createTargetGroup("app-tg", { port: EXPOSED_PORT, deregistrationDelay: 0 });

//Creating Listener for TargetGroup and setting port 
const web = atg.createListener("web", { port: EXPOSED_PORT });

secretService.getSecretAndWriteFile(AWS_SERVER_ACCESS_SECRET_NAME);

const containerImage = awsx.ecs.Image.fromPath('app-img', '../app');

const appService = new awsx.ecs.FargateService('app-svc', {
    cluster,
    taskDefinitionArgs: {
        container: {
            image: containerImage,
            portMappings: [web]
        },
    },
    desiredCount: 1,
});

export const url = pulumi.interpolate`${web.endpoint.hostname}`;