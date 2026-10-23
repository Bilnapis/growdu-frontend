export type Student = {
  id: string
  name: string
  level: string
  school: string
  parent: string
  phone: string
  email: string
  address: string
  group: string
  active: boolean
}

export type StudentInput = Omit<Student, 'id'>

// Local demo records only; no backend contract is implied by this view model.
export const demoStudents: Student[] = [
  {
    id: 'student-1',
    name: 'Nadia Putri',
    level: '8',
    school: 'SMP 3',
    parent: 'Ibu Sari',
    phone: '0812-3344-9988',
    email: 'ortu@example.com',
    address: 'Jl. Melati No. 12, Bandung',
    group: 'Kelas 8A',
    active: true,
  },
  {
    id: 'student-2',
    name: 'Raka Pratama',
    level: '12',
    school: 'SMA 1',
    parent: 'Pak Arman',
    phone: '0857-2001-4444',
    email: 'raka.parent@example.com',
    address: 'Jl. Anggrek Raya 8, Bandung',
    group: 'UTBK Fisika',
    active: true,
  },
  {
    id: 'student-3',
    name: 'Alya Safira',
    level: '6',
    school: 'SD Harapan',
    parent: 'Ibu Dina',
    phone: '',
    email: '',
    address: 'Jl. Cemara Indah 21, Cimahi',
    group: '',
    active: true,
  },
  {
    id: 'student-4',
    name: 'Dito Mahendra',
    level: '9',
    school: 'SMP 5',
    parent: 'Pak Budi',
    phone: '0813-8888-2222',
    email: 'dito@example.com',
    address: 'Jl. Terusan Buah Batu 45, Bandung',
    group: 'Kelas 9B',
    active: true,
  },
  {
    id: 'student-5',
    name: 'Mira Santoso',
    level: '7',
    school: 'SMP 2',
    parent: 'Ibu Hana',
    phone: '0819-7777-0101',
    email: 'hana@example.com',
    address: 'Jl. Cikutra Barat 17, Bandung',
    group: '',
    active: false,
  },
  {
    id: 'student-6',
    name: 'Fajar Ramadhan',
    level: '8',
    school: 'SMP 3',
    parent: 'Ibu Ratna',
    phone: '0812-0000-0006',
    email: 'ratna@example.com',
    address: 'Jl. Mawar 6, Bandung',
    group: 'Kelas 8A',
    active: true,
  },
  {
    id: 'student-7',
    name: 'Salma Zahra',
    level: '12',
    school: 'SMA 1',
    parent: 'Pak Dedi',
    phone: '0812-0000-0007',
    email: '',
    address: 'Jl. Kenanga 7, Bandung',
    group: 'UTBK Fisika',
    active: true,
  },
  {
    id: 'student-8',
    name: 'Bima Saputra',
    level: '6',
    school: 'SD Harapan',
    parent: 'Ibu Rina',
    phone: '0812-0000-0008',
    email: 'rina@example.com',
    address: 'Jl. Merdeka 8, Cimahi',
    group: '',
    active: true,
  },
  {
    id: 'student-9',
    name: 'Citra Lestari',
    level: '9',
    school: 'SMP 5',
    parent: 'Pak Agus',
    phone: '0812-0000-0009',
    email: 'agus@example.com',
    address: 'Jl. Sukajadi 9, Bandung',
    group: 'Kelas 9B',
    active: true,
  },
  {
    id: 'student-10',
    name: 'Rizky Fauzan',
    level: '7',
    school: 'SMP 2',
    parent: 'Ibu Wati',
    phone: '0812-0000-0010',
    email: 'wati@example.com',
    address: 'Jl. Setiabudi 10, Bandung',
    group: '',
    active: false,
  },
  {
    id: 'student-11',
    name: 'Intan Permata',
    level: '8',
    school: 'SMP 3',
    parent: 'Pak Hadi',
    phone: '',
    email: '',
    address: 'Jl. Sukamaju 11, Bandung',
    group: '',
    active: true,
  },
]

export function getStudentStatus(student: Student) {
  if (!student.active) return 'inactive'
  return !student.phone || !student.email ? 'incomplete' : 'active'
}

export function getStudentStage(level: string) {
  return Number(level) <= 6 ? 'SD' : Number(level) <= 9 ? 'SMP' : 'SMA'
}
