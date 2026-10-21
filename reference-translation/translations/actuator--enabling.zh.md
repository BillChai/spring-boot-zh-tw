# 啟用正式環境就緒功能

[`spring-boot-actuator`][r1] 模組提供 Spring Boot 所有正式環境就緒功能。
建議加入 `spring-boot-starter-actuator` starter 依賴來啟用這些功能。

**Actuator 的定義**

Actuator 是製造業術語，指用來移動或控制某個物體的機械裝置。
致動器能將微小的變化轉換成大幅度的運動。

若要在 Maven 專案加入 actuator，請加入以下 starter 依賴：

{{CODE_0}}

Gradle 則使用以下宣告：

{{CODE_1}}
