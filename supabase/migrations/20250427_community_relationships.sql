
-- Create a new table for managing relationships between communities
CREATE TABLE IF NOT EXISTS community_relationships (
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  member_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  display_order INTEGER DEFAULT 0,
  relationship_type TEXT NOT NULL DEFAULT 'group',
  PRIMARY KEY (community_id, member_id)
);

-- Add comment to the table
COMMENT ON TABLE community_relationships IS 'Stores relationships between communities, such as group membership';

-- Create an index on the relationship_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_community_relationships_type ON community_relationships(relationship_type);

-- Migrate existing data from community_group_members if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'community_group_members') THEN
      
    -- Insert data from community_group_members into community_relationships
    INSERT INTO community_relationships (community_id, member_id, added_at, display_order, relationship_type)
    SELECT parent_id, community_id, added_at, display_order, 'group'
    FROM community_group_members
    ON CONFLICT (community_id, member_id) DO NOTHING;
    
    -- Drop the old table (commented out for safety - uncomment when ready)
    -- DROP TABLE community_group_members;
  END IF;
END $$;
