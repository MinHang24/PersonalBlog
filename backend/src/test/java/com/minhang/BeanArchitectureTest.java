package com.minhang;

import com.minhang.bean.content.enums.ContentKind;
import com.minhang.controller.content.AdminContentController;
import com.minhang.controller.content.PublicContentController;
import com.minhang.service.content.ContentService;
import com.minhang.service.content.policy.ContentPolicyRegistry;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.aop.support.AopUtils;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class BeanArchitectureTest {
    @Autowired ContentPolicyRegistry registry;
    @Autowired ContentService service;

    @Test void allModulesAreManagedAndServiceIsTransactionProxied() {
        for (ContentKind kind : ContentKind.values()) {
            assertEquals(kind, registry.get(kind).kind());
        }
        assertTrue(AopUtils.isAopProxy(service));
    }

    @Test void controllersDoNotDependOnPersistence() {
        for (Class<?> controller : new Class<?>[]{AdminContentController.class, PublicContentController.class}) {
            for (var field : controller.getDeclaredFields()) {
                assertFalse(field.getType().getPackageName().startsWith("com.minhang.mapper"));
            }
            for (var method : controller.getDeclaredMethods()) {
                assertFalse(method.getGenericReturnType().getTypeName().contains("ContentDO"));
            }
        }
    }
}
