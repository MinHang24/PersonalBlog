package blog;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.dao.DataIntegrityViolationException;
@RestControllerAdvice public class Errors {
 @ExceptionHandler(DataIntegrityViolationException.class) ResponseEntity<?> duplicate(){return ResponseEntity.status(409).body(java.util.Map.of("error","Slug already exists or data conflicts"));}
}
