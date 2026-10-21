# Recording HTTP Exchanges

You can enable recording of HTTP exchanges by providing a bean of type [`HttpExchangeRepository`][r1] in your application’s configuration.
For convenience, Spring Boot offers [`InMemoryHttpExchangeRepository`][r2], which, by default, stores the last 100 request-response exchanges.
[`InMemoryHttpExchangeRepository`][r2] is limited compared to tracing solutions, and we recommend using it only for development environments.
For production environments, we recommend using a production-ready tracing or observability solution, such as Zipkin or OpenTelemetry.
Alternatively, you can create your own [`HttpExchangeRepository`][r1].

You can use the `httpexchanges` endpoint to obtain information about the request-response exchanges that are stored in the [`HttpExchangeRepository`][r1].

## Custom HTTP Exchange Recording

To customize the items that are included in each recorded exchange, use the `management.httpexchanges.recording.include` configuration property.

To disable recording entirely, set `management.httpexchanges.recording.enabled` to `false`.
