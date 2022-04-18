## NGINX-AWS Demo - _not so official readme_
- It is a demo project for demonstraing usage of Pulumi as IaC to deploy or update existing resources the code demands from AWS to do.
- The project is a nginx webserver protected with .htpasswd with custom html.
- All server access credentials are placed on AWS Secret Manager
- A .htpassword file gets created during runtime of pulumi and during docker build it will copy to the proper directory
---
- The setup AWS resources are very basic indeed which are the following:
  - ECS Cluster
  - ECR - generated automaticially on docker build command
  - ELB with TargetGroup and its Listener
  - ECS FargateService which deployed on the Cluster
  - AWS Secret Manager - to store .htpasswd accesses for the webserver
- Two different GitHub Actions have been set up:
  - Triggered by pull-request:
    - This will first run the CI part which is two tests which are succeeds alright
    - Then it will build and run pulumi preview to **see** the desired changes on resources
 - Triggered by push action on main(master):
   - This is the CD part basically, it will build and run pulumi up to **make** the desired changes on resources
## Known issue(s)
- pull_request actions somehow fails even though only change from push actions is the command that Pulumi takes.
