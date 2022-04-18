import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
import secretService = require('./secret-retriever.service');

const stack = pulumi.getStack()

const EXPOSED_PORT = parseInt(process.env.AWS_EXPOSED_PORT as string) || 80;
const AWS_SERVER_ACCESS_SECRET_NAME = process.env.AWS_SERVER_ACCESS_SECRET_NAME

//Creating ECS Cluster with name prefix os cluster.
const cluster = new awsx.ecs.Cluster("cluster", { name: "cluster" });

//Creating Application LoadBalancer that is exposed to the internet, single point of access.
const alb = new awsx.elasticloadbalancingv2.ApplicationLoadBalancer("app-lb", { external: true, securityGroups: cluster.securityGroups });

//Creating TargetGroup for LoadBalancer and setting port and deregistrarion delay to 0s.
const atg = alb.createTargetGroup("app-tg", { port: EXPOSED_PORT, deregistrationDelay: 0 });

//Creating Listener for TargetGroup and setting port 
const web = atg.createListener("web", { port: EXPOSED_PORT });

//Getting ServerAccess secret, write it to a file what docker build will use
secretService.getSecretAndWriteFile(AWS_SERVER_ACCESS_SECRET_NAME);

//Building dockerfile and pushing dockerimage to ECR
const containerImage = awsx.ecs.Image.fromPath('app-img', '../app');

//Deploying the webserver in a container on the cluster
const appService = new awsx.ecs.FargateService('app-svc', {
    cluster,
    tags: { Name: "nginx-webserver" },
    taskDefinitionArgs: {
        container: {
            image: containerImage,
            portMappings: [web]
        },
    },
    desiredCount: 1,
});

export const url = pulumi.interpolate`${web.endpoint.hostname}`;
export const listenerPort = web.listener.port;
export const cluterName = cluster.cluster.name;