package blog;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
@Configuration public class Security {
 @Bean UserDetailsService users(){
  String password=System.getenv("BLOG_ADMIN_PASSWORD");
  if(password==null||password.length()<16) throw new IllegalStateException("Set BLOG_ADMIN_PASSWORD to at least 16 characters");
  return new InMemoryUserDetailsManager(User.withUsername("admin").password(new BCryptPasswordEncoder().encode(password)).roles("ADMIN").build());
 }
 @Bean SecurityFilterChain chain(HttpSecurity h)throws Exception {
  return h.authorizeHttpRequests(a->a.requestMatchers("/api/public/**","/api/health","/api/csrf").permitAll().anyRequest().hasRole("ADMIN"))
   .httpBasic(org.springframework.security.config.Customizer.withDefaults())
   .build();
 }
}
