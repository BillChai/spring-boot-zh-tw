# 啟用正式環境就緒功能

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/actuator/enabling.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/actuator/enabling.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/actuator/enabling.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

[`spring-boot-actuator`][actuator--enabling-r1] 模組提供 Spring Boot 所有正式環境就緒功能。
建議加入 `spring-boot-starter-actuator` starter 依賴來啟用這些功能。

**Actuator 的定義**

Actuator 是製造業術語，指用來移動或控制某個物體的機械裝置。
致動器能將微小的變化轉換成大幅度的運動。

若要在 Maven 專案加入 actuator，請加入以下 starter 依賴：

```xml
<dependencies>
	<dependency>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-actuator</artifactId>
	</dependency>
</dependencies>
```

Gradle 則使用以下宣告：

```gradle
dependencies {
	implementation 'org.springframework.boot:spring-boot-starter-actuator'
}
```

[actuator--enabling-r1]: https://github.com/spring-projects/spring-boot/tree/v4.1.1/module/spring-boot-actuator
