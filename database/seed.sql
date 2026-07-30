insert into subjects(name)
values

('Mathematics'),
('English Language'),
('Physics'),
('Chemistry'),
('Biology'),
('Further Mathematics'),
('Economics'),
('Accounting'),
('Government'),
('Literature'),
('Geography'),
('Computer Science')

on conflict do nothing;



insert into packages(

package_name,
lessons_per_week,
type

)

values

('Package 1',2,'Small Group'),

('Package 2',2,'Private'),

('Package 3',2,'Premium')

on conflict do nothing;