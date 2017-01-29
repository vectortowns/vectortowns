use vectortowns;

drop procedure if exists save_last_access;
drop table if exists configuration;
drop table if exists locale;
drop table if exists password_recovery;
drop table if exists last_access;
drop table if exists user;
drop table if exists type;
drop table if exists profile;

create table profile (
    id smallint unsigned not null unique auto_increment,
    description varchar(30) unique not null,
    primary key (id)
);
insert into profile (description) values ('player');
insert into profile (description) values ('mediator');
insert into profile (description) values ('administrator');

create table type (
    id smallint unsigned not null unique auto_increment,
    description varchar(30) unique not null,
    primary key (id)
);
insert into type (description) values ('vectortowns');
insert into type (description) values ('google');

create table user (
    id bigint unsigned not null unique auto_increment,
    type_id smallint unsigned not null,
    login varchar(1024) not null,
    email varchar(1024) not null,
    profile_id smallint unsigned not null default 1,
    agreement_terms timestamp null default null,
    password char(128) null,
    primary key (id),
    foreign key (profile_id) references profile(id),
    foreign key (type_id) references type(id)
);
insert into user (type_id,login,email,profile_id,password) values (1,'lgapontes','lgapontes@gmail.com',3,'e497c5231efb2a02b2ecd671dfa235f853fd660dfb05c84c458625f238d0d8ff61537390d6769f60ada2321b990c8115613c05a1a3dac660103020bb0137dd51');

create table last_access (
    user_id bigint unsigned not null unique,
    module varchar(1024) not null,
    timestamp timestamp not null default current_timestamp,
    primary key (user_id),
    foreign key (user_id) references user(id)
);

create table password_recovery (
    user_id bigint unsigned not null,
    access_hash char(128) not null unique,
    request_date timestamp null default null,
    deadline_date timestamp null default null,
    use_date timestamp null default null,
    disabled boolean not null default false,
    primary key (user_id,access_hash),
    foreign key (user_id) references user(id)
);

create table locale (
    id char(5) not null unique,
    description varchar(100) not null unique,
    abbreviation char(2) not null unique,
    primary key (id)
);
insert into locale (id,description,abbreviation) values ('pt_BR','Português (Brasil)','br');
insert into locale (id,description,abbreviation) values ('en_US','English (US)','us');

create table configuration (
    user_id bigint unsigned not null unique,
    receive_emails boolean not null default true,
    locale_id char(5) not null,
    primary key (user_id),
    foreign key (user_id) references user(id),
    foreign key (locale_id) references locale(id)
);
insert into configuration (user_id, locale_id) value (1,'pt_BR');

/*
    Stored procedure to save last access. To call, use:
    call save_last_access(1,'lgapontes','module_name','pt_BR');
*/
delimiter $$
create procedure save_last_access(
    in p_type_id smallint unsigned,
    in p_login varchar(1024),
    in p_module varchar(30),
    in p_locale_id char(5)
) proc_label:begin
    /*
        All users must have a record in the access e configuration tables.
        If they do not, there is an error in the system.
        To avoid a problem, this procedure will create the registry if it does not exist.
    */
    declare v_user_id bigint unsigned default null;
    declare v_access_found boolean default null;
    declare v_configuration_found boolean default null;
    declare v_locale_id char(5) default null;
    declare v_message_text varchar(1024) default null;

    /* Declare 'handlers' for exceptions */
    declare speciality condition for sqlstate '45000';

    /* If the user does not exist, send error */
    select id into v_user_id from user where type_id=p_type_id and login=p_login;
    if (v_user_id is null) then
        select concat('There was an attempt to update the settings of a nonexistent user (login=',p_login,', type_id=',p_type_id,')') into v_message_text;
        signal sqlstate '45000' set message_text = v_message_text;
    end if;

    /* Search access */
    select 1 as found into v_access_found from last_access where user_id = v_user_id;

    /* Insert or update access */
    if (v_access_found is null) then
        insert into last_access (user_id,module) values (v_user_id,p_module);
    else
        update last_access set module=p_module, timestamp=now() where user_id=v_user_id;
    end if;

    /* Search configuration */
    select 1 as found into v_configuration_found from configuration where user_id=v_user_id;

    /* Insert configuration, if necessary */
    if (v_configuration_found is null) then
        select id into v_locale_id from locale where id = p_locale_id;
        if (v_locale_id is null) then
            set v_locale_id = 'en_US';
        end if;
        insert into configuration (user_id, locale_id) value (v_user_id, v_locale_id);
    end if;

    /* Position was created */
    select 0 as 'error';
END $$
delimiter ;