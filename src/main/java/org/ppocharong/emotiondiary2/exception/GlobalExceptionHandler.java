package org.ppocharong.emotiondiary2.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.NoHandlerFoundException;


@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * 모든 RuntimeException 처리
     * @param ex 발생한 RuntimeException 객체
     * @return 오류 메시지와 BAD_REQUEST 상태 코드로 응답
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        logger.error("런타임 예외 발생: ", ex);
        return new ResponseEntity<>("런타임 예외가 발생했습니다: " + ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    /**
     * 404 Not Found 처리
     * @param ex 발생한 NoHandlerFoundException 객체
     * @return 리소스를 찾을 수 없다는 메시지와 NOT_FOUND 상태 코드로 응답
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<String> handleNotFoundException(NoHandlerFoundException ex) {
        logger.warn("404 리소스를 찾을 수 없음: ", ex);
        return new ResponseEntity<>("리소스를 찾을 수 없습니다", HttpStatus.NOT_FOUND);
    }

    /**
     * DataIntegrityViolationException 처리
     * @param ex 데이터 무결성 위반 예외 객체
     * @return 데이터 무결성 위반 메시지와 CONFLICT 상태 코드로 응답
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<String> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        logger.error("데이터 무결성 위반: ", ex);
        return new ResponseEntity<>("데이터 무결성 위반: " + ex.getMessage(), HttpStatus.CONFLICT);
    }

    /**
     * 유효성 검사 실패 예외 처리
     * @param ex 발생한 MethodArgumentNotValidException 객체
     * @return 유효성 검사 실패 메시지와 BAD_REQUEST 상태 코드로 응답
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<String> handleValidationException(MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        logger.warn("유효성 검사 실패: ", ex);
        return new ResponseEntity<>("유효성 검사 실패: " + errorMessage, HttpStatus.BAD_REQUEST);
    }
}
