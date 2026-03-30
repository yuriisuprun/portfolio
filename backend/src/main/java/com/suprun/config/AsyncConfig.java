package com.suprun.config;

import org.slf4j.MDC;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.TaskDecorator;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.Map;
import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncConfig {

    /**
     * Propagates MDC (e.g. correlationId) into @Async execution so logs can be correlated
     * across request thread and async thread.
     */
    @Bean
    public TaskDecorator mdcTaskDecorator() {
        return runnable -> {
            Map<String, String> contextMap = MDC.getCopyOfContextMap();
            return () -> {
                Map<String, String> previous = MDC.getCopyOfContextMap();
                try {
                    if (contextMap == null || contextMap.isEmpty()) {
                        MDC.clear();
                    } else {
                        MDC.setContextMap(contextMap);
                    }
                    runnable.run();
                } finally {
                    if (previous == null || previous.isEmpty()) {
                        MDC.clear();
                    } else {
                        MDC.setContextMap(previous);
                    }
                }
            };
        };
    }

    /**
     * Overrides Spring Boot's default application executor so MDC propagation is applied.
     * Sizing is intentionally modest for this project; override via Spring Boot task execution
     * properties if needed.
     */
    @Bean(name = "applicationTaskExecutor")
    public Executor applicationTaskExecutor(TaskDecorator taskDecorator) {
        ThreadPoolTaskExecutor exec = new ThreadPoolTaskExecutor();
        exec.setThreadNamePrefix("app-async-");
        exec.setCorePoolSize(4);
        exec.setMaxPoolSize(16);
        exec.setQueueCapacity(1000);
        exec.setAwaitTerminationSeconds(10);
        exec.setWaitForTasksToCompleteOnShutdown(true);
        exec.setTaskDecorator(taskDecorator);
        exec.initialize();
        return exec;
    }
}
