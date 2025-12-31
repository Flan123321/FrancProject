-- SIMULACIÓN DE SABOTAJE (Ejecutar en Supabase SQL Editor)

BEGIN;

DO $$
DECLARE 
  v_user_id UUID := gen_random_uuid();
  v_log_id UUID;
  v_count INTEGER;
BEGIN
  -- 1. EL ESCENARIO: Un usuario legítimo crea un registro
  -- (Simulamos que somos el usuario autenticado)
  
  INSERT INTO audit_logs (user_id, action, metadata)
  VALUES (v_user_id, 'USER_LOGIN', '{"ip": "192.168.1.1"}'::jsonb)
  RETURNING id INTO v_log_id;
  
  RAISE NOTICE 'Paso 1: Evidenca creada. Log ID: %', v_log_id;

  -- 2. EL INTENTO DE HACKEO / REESCRITURA
  -- El usuario intenta cambiar su acción de 'USER_LOGIN' a 'NOTHING_HAPPENED'
  -- Sin política de UPDATE, esto debería afectar a 0 filas o fallar (dependiendo del rol)
  
  UPDATE audit_logs 
  SET action = 'NOTHING_HAPPENED' 
  WHERE id = v_log_id;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  IF v_count > 0 THEN
      RAISE EXCEPTION 'ALERTA: EL SABOTAJE FUNCIONÓ. LA INMUTABILIDAD FALLÓ.';
  ELSE
      RAISE NOTICE 'Paso 2: Intento de modificación RECHAZADO (Filas afectadas: %)', v_count;
  END IF;

  -- 3. EL INTENTO DE ELIMINACIÓN DE EVIDENCIA
  -- El usuario intenta borrar su rastro
  
  DELETE FROM audit_logs 
  WHERE id = v_log_id;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  IF v_count > 0 THEN
      RAISE EXCEPTION 'ALERTA: EVIDENCIA ELIMINADA. LA INMUTABILIDAD FALLÓ.';
  ELSE
      RAISE NOTICE 'Paso 3: Intento de eliminación RECHAZADO (Filas afectadas: %)', v_count;
  END IF;

  -- CONCLUSIÓN
  RAISE NOTICE 'PRUEBA EXITOSA: El Sistema es Inmune al Sabotaje.';

END $$;

ROLLBACK; -- Revertimos para no ensuciar, aunque en la realidad, el INSERT se quedaría.
