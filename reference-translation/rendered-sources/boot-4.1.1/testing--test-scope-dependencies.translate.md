# Test Scope Dependencies

The `spring-boot-starter-test` starter (in the `test` `scope`) contains the following provided libraries:

- [JUnit][r1]: The de-facto standard for unit testing Java applications.
- [Spring Test][r2] & Spring Boot Test: Utilities and integration test support for Spring Boot applications.
- [AssertJ][r3]: A fluent assertion library.
- [Hamcrest][r4]: A library of matcher objects (also known as constraints or predicates).
- [Mockito][r5]: A Java mocking framework.
- [JSONassert][r6]: An assertion library for JSON.
- [JsonPath][r7]: XPath for JSON.
- [Awaitility][r8]: A library for testing asynchronous systems.

We generally find these common libraries to be useful when writing tests.
If these libraries do not suit your needs, you can add additional test dependencies of your own.
