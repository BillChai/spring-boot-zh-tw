# Cloud Foundry Support

Spring Boot’s `spring-boot-cloudfoundry` module (part of `spring-boot-starter-cloudfoundry`) includes additional support that is activated when you deploy to a compatible Cloud Foundry instance.
The `/cloudfoundryapplication` path provides an alternative secured route to all [`@Endpoint`][r1] beans.

The extended support lets Cloud Foundry management UIs (such as the web application that you can use to view deployed applications) be augmented with Spring Boot actuator information.
For example, an application status page can include full health information instead of the typical “running” or “stopped” status.

> [NOTE]
>
> The `/cloudfoundryapplication` path is not directly accessible to regular users.
> To use the endpoint, you must pass a valid UAA token with the request.

## Disabling Extended Cloud Foundry Actuator Support

If you want to fully disable the `/cloudfoundryapplication` endpoints, you can add the following setting to your `application.properties` file:

{{CODE_0}}

{{CODE_1}}

## Cloud Foundry Self-signed Certificates

By default, the security verification for `/cloudfoundryapplication` endpoints makes SSL calls to various Cloud Foundry services.
If your Cloud Foundry UAA or Cloud Controller services use self-signed certificates, you need to set the following property:

{{CODE_2}}

{{CODE_3}}

## Custom Context Path

If the server’s context-path has been configured to anything other than `/`, the Cloud Foundry endpoints are not available at the root of the application.
For example, if `server.servlet.context-path=/app`, Cloud Foundry endpoints are available at `/app/cloudfoundryapplication/*`.

If you expect the Cloud Foundry endpoints to always be available at `/cloudfoundryapplication/*`, regardless of the server’s context-path, you need to explicitly configure that in your application.
The configuration differs, depending on the web server in use.
For Tomcat, you can add the following configuration:

{{CODE_4}}

{{CODE_5}}

If you’re using a Webflux based application, you can use the following configuration:

{{CODE_6}}

{{CODE_7}}
