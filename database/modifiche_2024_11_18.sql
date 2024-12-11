ALTER TABLE tour ADD COLUMN state character varying(80) NOT NULL DEFAULT '01';
update: v_tour, v_tour_space, v_tour_media

ALTER TABLE art ADD COLUMN link character varying(1024);