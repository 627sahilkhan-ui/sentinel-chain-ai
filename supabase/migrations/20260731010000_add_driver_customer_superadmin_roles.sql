-- Add new roles to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'driver';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'customer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';

-- Add phone and role_type columns to profiles for driver/customer distinction
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'viewer';

-- Create a function to check if user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin');
$$;

GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated, service_role;

-- Allow super_admins to view all profiles
CREATE POLICY "Super admins can view all profiles" ON public.profiles 
  FOR SELECT TO authenticated 
  USING (public.is_super_admin(auth.uid()));

-- Allow super_admins to update all profiles
CREATE POLICY "Super admins can update all profiles" ON public.profiles 
  FOR UPDATE TO authenticated 
  USING (public.is_super_admin(auth.uid()));

-- Allow super_admins to delete profiles
CREATE POLICY "Super admins can delete profiles" ON public.profiles 
  FOR DELETE TO authenticated 
  USING (public.is_super_admin(auth.uid()));

-- Super admins can manage all roles
CREATE POLICY "Super admins can manage all roles" ON public.user_roles 
  FOR ALL TO authenticated 
  USING (public.is_super_admin(auth.uid())) 
  WITH CHECK (public.is_super_admin(auth.uid()));

-- Update handle_new_user to store user_type from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_type TEXT;
  _role public.app_role;
BEGIN
  _user_type := COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'viewer');
  
  -- Map user_type to role
  IF _user_type = 'driver' THEN
    _role := 'driver';
  ELSIF _user_type = 'customer' THEN
    _role := 'customer';
  ELSE
    _role := 'viewer';
  END IF;

  INSERT INTO public.profiles (id, email, display_name, avatar_url, phone, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'full_name', split_part(COALESCE(NEW.email, ''), '@', 1)),
    NEW.raw_user_meta_data ->> 'avatar_url',
    NEW.raw_user_meta_data ->> 'phone',
    _user_type
  )
  ON CONFLICT (id) DO UPDATE SET
    user_type = EXCLUDED.user_type,
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;