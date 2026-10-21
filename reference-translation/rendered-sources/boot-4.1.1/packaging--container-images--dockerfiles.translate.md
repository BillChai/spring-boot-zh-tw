# Dockerfiles

While it is possible to convert a Spring Boot uber jar into a Docker image with just a few lines in the `Dockerfile`, using the [layering feature][r1] will result in an optimized image.
When you create a jar containing the layers index file, the `spring-boot-jarmode-tools` jar will be added as a dependency to your jar.
With this jar on the classpath, you can launch your application in a special mode which allows the bootstrap code to run something entirely different from your application, for example, something that extracts the layers.

Here’s how you can launch your jar with a `tools` jar mode:

{{CODE_0}}

This will provide the following output:

{{CODE_1}}

The `extract` command can be used to easily split the application into layers to be added to the `Dockerfile`.
Here is an example of a `Dockerfile` using `jarmode`.

{{CODE_2}}

Assuming the above `Dockerfile` is in the current directory, your Docker image can be built with `docker build .`, or optionally specifying the path to your application jar, as shown in the following example:

{{CODE_3}}

This is a multi-stage `Dockerfile`.
The builder stage extracts the directories that are needed later.
Each of the `COPY` commands relates to the layers extracted by the jarmode.

Of course, a `Dockerfile` can be written without using the `jarmode`.
You can use some combination of `unzip` and `mv` to move things to the right layer but `jarmode` simplifies that.
Additionally, the layout created by the `jarmode` is AOT cache (and CDS) friendly out of the box.

## AOT cache

If you are using Java 25 or above, and want to additionally enable the [AOT cache][r2], you can use this `Dockerfile`:

{{CODE_4}}

This is mostly the same as the above `Dockerfile`.
As the last steps, it creates the AOT cache file by doing a training run and passes the AOT cache parameter to `java -jar`.

## CDS

> [NOTE]
>
> If you’re using Java 24 or later, please use AOT cache instead of CDS.

If you want to additionally enable [CDS][r3], you can use this `Dockerfile`:

{{CODE_5}}

This is mostly the same as the above `Dockerfile`.
As the last steps, it creates the CDS archive by doing a training run and passes the CDS parameter to `java -jar`.

> [NOTE]
>
> If you are using Java 25 or above, we recommend using an AOT cache instead of CDS.
