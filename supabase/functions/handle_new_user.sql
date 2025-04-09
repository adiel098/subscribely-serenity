
-- Updated trigger function to use the 'users' table instead of 'profiles'
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
BEGIN
  INSERT INTO public.users (id, full_name, first_name, last_name, email)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.email
  );
  RETURN new;
END;
$$;
