# Cloud Native Buildpacks

Docker images can be built directly from your Maven or Gradle plugin using [Cloud Native Buildpacks][r1].
If you’ve ever used an application platform such as Cloud Foundry or Heroku then you’ve probably used a buildpack.
Buildpacks are the part of the platform that takes your application and converts it into something that the platform can actually run.
For example, Cloud Foundry’s Java buildpack will notice that you’re pushing a `.jar` file and automatically add a relevant JRE.

With Cloud Native Buildpacks, you can create Docker compatible images that you can run anywhere.
Spring Boot includes buildpack support directly for both Maven and Gradle.
This means you can just type a single command and quickly get a sensible image into your locally running Docker daemon.

See the individual plugin documentation on how to use buildpacks with [Maven][r2] and [Gradle][r3].

> [NOTE]
>
> The [Paketo Spring Boot buildpack][r4] supports the `layers.idx` file, so any [layer customization][r5] that is applied to it will be reflected in the image created by the buildpacks.

> [NOTE]
>
> In order to achieve reproducible builds and container image caching, buildpacks can manipulate the application resources metadata (such as the file "last modified" information).
> You should ensure that your application does not rely on that metadata at runtime.
> Spring Boot can use that information when serving static resources, but this can be disabled with `spring.web.resources.cache.use-last-modified`.
