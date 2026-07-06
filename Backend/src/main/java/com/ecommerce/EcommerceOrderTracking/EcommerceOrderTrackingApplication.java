package com.ecommerce.EcommerceOrderTracking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.ecommerce")
@EnableJpaRepositories(basePackages = "com.ecommerce.repository")
@EntityScan(basePackages = "com.ecommerce.entity")
public class EcommerceOrderTrackingApplication {

	public static void main(String[] args) {
		SpringApplication.run(EcommerceOrderTrackingApplication.class, args);
	}

}
