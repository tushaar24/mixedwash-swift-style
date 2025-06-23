
-- Create a function to migrate temp customer data to main tables
CREATE OR REPLACE FUNCTION public.migrate_temp_customer_data(user_phone TEXT, authenticated_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    temp_customer_record RECORD;
    temp_address_record RECORD;
    temp_order_record RECORD;
    new_address_id UUID;
    address_mapping JSONB := '{}';
BEGIN
    -- Find temp customer by phone number
    SELECT * INTO temp_customer_record 
    FROM temp_customers 
    WHERE customer_phone_number = user_phone;
    
    -- If no temp customer found, return false
    IF temp_customer_record IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Update the authenticated user's profile with temp customer data
    UPDATE profiles 
    SET 
        username = COALESCE(username, temp_customer_record.customer_name),
        email = COALESCE(email, temp_customer_record.customer_email_address),
        updated_at = now()
    WHERE id = authenticated_user_id;
    
    -- Migrate addresses and track ID mappings
    FOR temp_address_record IN 
        SELECT * FROM addresses_temp WHERE user_id = temp_customer_record.id
    LOOP
        -- Insert new address
        INSERT INTO addresses (
            user_id, address_line1, address_line2, city, state, 
            postal_code, house_building, area, is_default, 
            latitude, longitude
        ) VALUES (
            authenticated_user_id, temp_address_record.address_line1, 
            temp_address_record.address_line2, temp_address_record.city, 
            temp_address_record.state, temp_address_record.postal_code, 
            temp_address_record.house_building, temp_address_record.area, 
            temp_address_record.is_default, temp_address_record.latitude, 
            temp_address_record.longitude
        ) RETURNING id INTO new_address_id;
        
        -- Store address ID mapping for orders migration
        address_mapping := jsonb_set(
            address_mapping, 
            ARRAY[temp_address_record.id::text], 
            to_jsonb(new_address_id::text)
        );
    END LOOP;
    
    -- Migrate orders with updated address references
    FOR temp_order_record IN 
        SELECT * FROM orders_temp WHERE user_id = temp_customer_record.id
    LOOP
        INSERT INTO orders (
            user_id, address_id, service_id, pickup_date, pickup_slot_id,
            delivery_date, delivery_slot_id, estimated_weight, total_amount,
            special_instructions, status
        ) VALUES (
            authenticated_user_id,
            (address_mapping ->> temp_order_record.address_id::text)::UUID,
            temp_order_record.service_id,
            temp_order_record.pickup_date,
            temp_order_record.pickup_slot_id,
            temp_order_record.delivery_date,
            temp_order_record.delivery_slot_id,
            temp_order_record.estimated_weight,
            temp_order_record.total_amount,
            temp_order_record.special_instructions,
            temp_order_record.status
        );
    END LOOP;
    
    -- Clean up temp data
    DELETE FROM orders_temp WHERE user_id = temp_customer_record.id;
    DELETE FROM addresses_temp WHERE user_id = temp_customer_record.id;
    DELETE FROM temp_customers WHERE id = temp_customer_record.id;
    
    RETURN TRUE;
END;
$$;
