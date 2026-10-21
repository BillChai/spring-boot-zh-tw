# Enabling Production-ready Features

The [`spring-boot-actuator`][r1] module provides all of Spring Boot’s production-ready features.
The recommended way to enable the features is to add a dependency on the `spring-boot-starter-actuator` starter.

Definition of Actuator

An actuator is a manufacturing term that refers to a mechanical device for moving or controlling something.
Actuators can generate a large amount of motion from a small change.

To add the actuator to a Maven-based project, add the following starter dependency:

{{CODE_0}}

For Gradle, use the following declaration:

{{CODE_1}}
