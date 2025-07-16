import React, { useState } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Users, 
  BookOpen, 
  Calendar, 
  DollarSign,
  User,
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Receipt,
  UserPlus,
  Filter,
  X,
  Eye,
  FileText
} from 'lucide-react';
import { Course, CourseBatch, Student, Enrollment, CoursePayment } from '../types';

export function Courses() {
  const { 
    courses, 
    courseBatches, 
    students, 
    enrollments, 
    coursePayments,
    addCourse, 
    updateCourse, 
    deleteCourse,
    addCourseBatch,
    updateCourseBatch,
    deleteCourseBatch,
    addStudent,
    updateStudent,
    deleteStudent,
    addEnrollment,
    updateEnrollment,
    deleteEnrollment,
    addCoursePayment,
    generatePaymentVoucher
  } = useInventory();

  const [activeTab, setActiveTab] = useState<'courses' | 'batches' | 'students' | 'enrollments' | 'payments'>('courses');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Form states
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);

  // Edit states
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingBatch, setEditingBatch] = useState<CourseBatch | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Course form
  const [courseForm, setCourseForm] = useState({
    name: '',
    duration: 0,
    price: 0,
    admissionFee: 0,
    registrationFee: 0,
    examFee: 0,
    description: '',
    materials: [] as string[],
    instructor: '',
    maxStudents: 0,
    status: 'active' as Course['status']
  });

  // Batch form
  const [batchForm, setBatchForm] = useState({
    courseId: '',
    batchName: '',
    startDate: '',
    endDate: '',
    schedule: '',
    maxStudents: 0,
    status: 'upcoming' as CourseBatch['status']
  });

  // Student form
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    emergencyContact: ''
  });

  // Enrollment form
  const [enrollmentForm, setEnrollmentForm] = useState({
    studentId: '',
    courseId: '',
    batchId: '',
    includeAdmissionFee: false,
    includeRegistrationFee: false,
    includeExamFee: false,
    initialPayment: 0,
    paymentMethod: 'cash' as CoursePayment['paymentMethod']
  });

  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    enrollmentId: '',
    studentId: '',
    paymentType: 'enrollment' as CoursePayment['paymentType'],
    amount: 0,
    paymentMethod: 'cash' as CoursePayment['paymentMethod'],
    description: '',
    receivedBy: 'Admin'
  });

  const [newMaterial, setNewMaterial] = useState('');

  // Filter functions
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredBatches = courseBatches.filter(batch => {
    const course = courses.find(c => c.id === batch.courseId);
    const courseName = course ? course.name.toLowerCase() : '';
    const matchesSearch = batch.batchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         courseName.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || batch.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.phone.includes(searchTerm);
    return matchesSearch;
  });

  const filteredEnrollments = enrollments.filter(enrollment => {
    const student = students.find(s => s.id === enrollment.studentId);
    const course = courses.find(c => c.id === enrollment.courseId);
    const batch = courseBatches.find(b => b.id === enrollment.batchId);
    
    const studentName = student ? student.name.toLowerCase() : '';
    const courseName = course ? course.name.toLowerCase() : '';
    const batchName = batch ? batch.batchName.toLowerCase() : '';
    
    const matchesSearch = studentName.includes(searchTerm.toLowerCase()) ||
                         courseName.includes(searchTerm.toLowerCase()) ||
                         batchName.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPayments = coursePayments.filter(payment => {
    const student = students.find(s => s.id === payment.studentId);
    const studentName = student ? student.name.toLowerCase() : '';
    const matchesSearch = studentName.includes(searchTerm.toLowerCase()) ||
                         payment.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Form handlers
  const handleCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCourse) {
      updateCourse(editingCourse.id, courseForm);
      setEditingCourse(null);
    } else {
      addCourse(courseForm);
    }
    resetCourseForm();
    setShowCourseForm(false);
  };

  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const batchData = {
      ...batchForm,
      startDate: new Date(batchForm.startDate),
      endDate: new Date(batchForm.endDate),
      currentStudents: 0
    };
    
    if (editingBatch) {
      updateCourseBatch(editingBatch.id, batchData);
      setEditingBatch(null);
    } else {
      addCourseBatch(batchData);
    }
    resetBatchForm();
    setShowBatchForm(false);
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const studentData = {
      ...studentForm,
      dateOfBirth: studentForm.dateOfBirth ? new Date(studentForm.dateOfBirth) : undefined
    };
    
    if (editingStudent) {
      updateStudent(editingStudent.id, studentData);
      setEditingStudent(null);
    } else {
      addStudent(studentData);
    }
    resetStudentForm();
    setShowStudentForm(false);
  };

  const handleEnrollmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const course = courses.find(c => c.id === enrollmentForm.courseId);
    if (!course) return;

    let totalFee = course.price;
    let additionalFees = 0;

    // Calculate additional fees
    if (enrollmentForm.includeAdmissionFee) {
      additionalFees += course.admissionFee;
    }
    if (enrollmentForm.includeRegistrationFee) {
      additionalFees += course.registrationFee;
    }
    if (enrollmentForm.includeExamFee) {
      additionalFees += course.examFee;
    }

    totalFee += additionalFees;

    const enrollmentData = {
      studentId: enrollmentForm.studentId,
      courseId: enrollmentForm.courseId,
      batchId: enrollmentForm.batchId,
      totalFee,
      paidAmount: enrollmentForm.initialPayment,
      remainingAmount: totalFee - enrollmentForm.initialPayment,
      admissionFeePaid: enrollmentForm.includeAdmissionFee,
      registrationFeePaid: enrollmentForm.includeRegistrationFee,
      examFeePaid: enrollmentForm.includeExamFee,
      status: 'active' as Enrollment['status']
    };

    addEnrollment(enrollmentData);

    // Add initial payment if any
    if (enrollmentForm.initialPayment > 0) {
      setTimeout(() => {
        const newEnrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
        const latestEnrollment = newEnrollments[newEnrollments.length - 1];
        
        if (latestEnrollment) {
          const paymentData = {
            enrollmentId: latestEnrollment.id,
            studentId: enrollmentForm.studentId,
            paymentType: 'enrollment' as CoursePayment['paymentType'],
            amount: enrollmentForm.initialPayment,
            paymentMethod: enrollmentForm.paymentMethod,
            paymentDate: new Date(),
            voucherNumber: `PAY-${Date.now()}`,
            description: 'Initial enrollment payment',
            receivedBy: 'Admin'
          };
          
          addCoursePayment(paymentData);
          generatePaymentVoucher(paymentData.voucherNumber);
        }
      }, 100);
    }

    resetEnrollmentForm();
    setShowEnrollmentForm(false);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const paymentData = {
      ...paymentForm,
      paymentDate: new Date(),
      voucherNumber: `PAY-${Date.now()}`
    };
    
    addCoursePayment(paymentData);
    generatePaymentVoucher(paymentData.voucherNumber);
    
    resetPaymentForm();
    setShowPaymentForm(false);
    setShowPaymentModal(false);
    setSelectedEnrollment(null);
  };

  const openPaymentModal = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setPaymentForm({
      enrollmentId: enrollment.id,
      studentId: enrollment.studentId,
      paymentType: 'enrollment',
      amount: enrollment.remainingAmount,
      paymentMethod: 'cash',
      description: 'Remaining amount payment',
      receivedBy: 'Admin'
    });
    setShowPaymentModal(true);
  };

  // Reset form functions
  const resetCourseForm = () => {
    setCourseForm({
      name: '',
      duration: 0,
      price: 0,
      admissionFee: 0,
      registrationFee: 0,
      examFee: 0,
      description: '',
      materials: [],
      instructor: '',
      maxStudents: 0,
      status: 'active'
    });
  };

  const resetBatchForm = () => {
    setBatchForm({
      courseId: '',
      batchName: '',
      startDate: '',
      endDate: '',
      schedule: '',
      maxStudents: 0,
      status: 'upcoming'
    });
  };

  const resetStudentForm = () => {
    setStudentForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      emergencyContact: ''
    });
  };

  const resetEnrollmentForm = () => {
    setEnrollmentForm({
      studentId: '',
      courseId: '',
      batchId: '',
      includeAdmissionFee: false,
      includeRegistrationFee: false,
      includeExamFee: false,
      initialPayment: 0,
      paymentMethod: 'cash'
    });
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      enrollmentId: '',
      studentId: '',
      paymentType: 'enrollment',
      amount: 0,
      paymentMethod: 'cash',
      description: '',
      receivedBy: 'Admin'
    });
  };

  // Edit handlers
  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      name: course.name,
      duration: course.duration,
      price: course.price,
      admissionFee: course.admissionFee,
      registrationFee: course.registrationFee,
      examFee: course.examFee,
      description: course.description,
      materials: course.materials,
      instructor: course.instructor,
      maxStudents: course.maxStudents,
      status: course.status
    });
    setShowCourseForm(true);
  };

  const handleEditBatch = (batch: CourseBatch) => {
    setEditingBatch(batch);
    setBatchForm({
      courseId: batch.courseId,
      batchName: batch.batchName,
      startDate: new Date(batch.startDate).toISOString().split('T')[0],
      endDate: new Date(batch.endDate).toISOString().split('T')[0],
      schedule: batch.schedule,
      maxStudents: batch.maxStudents,
      status: batch.status
    });
    setShowBatchForm(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setStudentForm({
      name: student.name,
      email: student.email,
      phone: student.phone,
      address: student.address,
      dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
      emergencyContact: student.emergencyContact || ''
    });
    setShowStudentForm(true);
  };

  // Utility functions
  const addMaterial = () => {
    if (newMaterial.trim()) {
      setCourseForm({
        ...courseForm,
        materials: [...courseForm.materials, newMaterial.trim()]
      });
      setNewMaterial('');
    }
  };

  const removeMaterial = (index: number) => {
    setCourseForm({
      ...courseForm,
      materials: courseForm.materials.filter((_, i) => i !== index)
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'dropped':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : 'Unknown Course';
  };

  const getBatchName = (batchId: string) => {
    const batch = courseBatches.find(b => b.id === batchId);
    return batch ? batch.batchName : 'Unknown Batch';
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown Student';
  };

  const calculateEnrollmentTotalFee = () => {
    const course = courses.find(c => c.id === enrollmentForm.courseId);
    if (!course) return 0;

    let total = course.price;
    if (enrollmentForm.includeAdmissionFee) total += course.admissionFee;
    if (enrollmentForm.includeRegistrationFee) total += course.registrationFee;
    if (enrollmentForm.includeExamFee) total += course.examFee;
    
    return total;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
        <p className="text-gray-600 mt-2">Manage courses, batches, students, and enrollments</p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="flex border-b overflow-x-auto">
          {[
            { id: 'courses', label: 'Courses', icon: BookOpen },
            { id: 'batches', label: 'Batches', icon: Calendar },
            { id: 'students', label: 'Students', icon: Users },
            { id: 'enrollments', label: 'Enrollments', icon: GraduationCap },
            { id: 'payments', label: 'Payments', icon: DollarSign }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
          
          {(activeTab === 'courses' || activeTab === 'batches' || activeTab === 'enrollments') && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              {activeTab === 'courses' && (
                <>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </>
              )}
              {activeTab === 'batches' && (
                <>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </>
              )}
              {activeTab === 'enrollments' && (
                <>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                  <option value="suspended">Suspended</option>
                </>
              )}
            </select>
          )}
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter size={16} />
            <span>Filters</span>
          </button>
          
          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-blue-600 hover:text-blue-800"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end mb-6">
        {activeTab === 'courses' && (
          <button
            onClick={() => setShowCourseForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={20} />
            <span>Add Course</span>
          </button>
        )}
        {activeTab === 'batches' && (
          <button
            onClick={() => setShowBatchForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors shadow-sm"
          >
            <Plus size={20} />
            <span>Add Batch</span>
          </button>
        )}
        {activeTab === 'students' && (
          <button
            onClick={() => setShowStudentForm(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-purple-700 transition-colors shadow-sm"
          >
            <UserPlus size={20} />
            <span>Add Student</span>
          </button>
        )}
        {activeTab === 'enrollments' && (
          <button
            onClick={() => setShowEnrollmentForm(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-orange-700 transition-colors shadow-sm"
          >
            <GraduationCap size={20} />
            <span>New Enrollment</span>
          </button>
        )}
        {activeTab === 'payments' && (
          <button
            onClick={() => setShowPaymentForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <CreditCard size={20} />
            <span>Add Payment</span>
          </button>
        )}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                      {course.status}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditCourse(course)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteCourse(course.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock size={16} />
                    <span className="text-sm">{course.duration} hours</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <User size={16} />
                    <span className="text-sm">{course.instructor}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users size={16} />
                    <span className="text-sm">Max {course.maxStudents} students</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Course Fee</p>
                      <p className="font-semibold text-green-600">${course.price}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Admission Fee</p>
                      <p className="font-semibold text-blue-600">${course.admissionFee}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Registration Fee</p>
                      <p className="font-semibold text-purple-600">${course.registrationFee}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Exam Fee</p>
                      <p className="font-semibold text-orange-600">${course.examFee}</p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mt-4 line-clamp-2">{course.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'batches' && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Batch Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Course</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Duration</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Schedule</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Students</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBatches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{batch.batchName}</td>
                    <td className="py-3 px-4">{getCourseName(batch.courseId)}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(batch.startDate).toLocaleDateString()} - {new Date(batch.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{batch.schedule}</td>
                    <td className="py-3 px-4">
                      <span className="text-sm">
                        {batch.currentStudents}/{batch.maxStudents}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                        {batch.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditBatch(batch)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteCourseBatch(batch.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{student.name}</h3>
                    <p className="text-sm text-gray-500">
                      Student since {new Date(student.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditStudent(student)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteStudent(student.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">{student.email}</p>
                  <p className="text-sm text-gray-600">{student.phone}</p>
                  {student.dateOfBirth && (
                    <p className="text-sm text-gray-600">
                      DOB: {new Date(student.dateOfBirth).toLocaleDateString()}
                    </p>
                  )}
                  {student.emergencyContact && (
                    <p className="text-sm text-gray-600">
                      Emergency: {student.emergencyContact}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Enrollments: {enrollments.filter(e => e.studentId === student.id).length}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'enrollments' && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Student</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Course</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Batch</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Total Fee</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Paid</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Remaining</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Fee Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {getStudentName(enrollment.studentId)}
                    </td>
                    <td className="py-3 px-4">{getCourseName(enrollment.courseId)}</td>
                    <td className="py-3 px-4">{getBatchName(enrollment.batchId)}</td>
                    <td className="py-3 px-4 font-medium">${enrollment.totalFee.toFixed(2)}</td>
                    <td className="py-3 px-4 text-green-600 font-medium">
                      ${enrollment.paidAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-red-600 font-medium">
                      ${enrollment.remainingAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-1">
                        <div className={`w-3 h-3 rounded-full ${enrollment.admissionFeePaid ? 'bg-green-500' : 'bg-gray-300'}`} title="Admission Fee"></div>
                        <div className={`w-3 h-3 rounded-full ${enrollment.registrationFeePaid ? 'bg-blue-500' : 'bg-gray-300'}`} title="Registration Fee"></div>
                        <div className={`w-3 h-3 rounded-full ${enrollment.examFeePaid ? 'bg-purple-500' : 'bg-gray-300'}`} title="Exam Fee"></div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                        {enrollment.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        {enrollment.remainingAmount > 0 && (
                          <button
                            onClick={() => openPaymentModal(enrollment)}
                            className="text-green-600 hover:text-green-800"
                            title="Make Payment"
                          >
                            <CreditCard size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteEnrollment(enrollment.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Enrollment"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Voucher #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Student</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Payment Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Method</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Received By</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">{payment.voucherNumber}</td>
                    <td className="py-3 px-4">{getStudentName(payment.studentId)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        payment.paymentType === 'enrollment' ? 'bg-green-100 text-green-800' :
                        payment.paymentType === 'registration' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {payment.paymentType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-green-600">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 capitalize">{payment.paymentMethod}</td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">{payment.receivedBy}</td>
                    <td className="py-3 px-4">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        title="View Receipt"
                      >
                        <Receipt size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Course Form Modal */}
      {showCourseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingCourse ? 'Edit Course' : 'Add New Course'}
            </h2>
            <form onSubmit={handleCourseSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
                  <input
                    type="text"
                    value={courseForm.name}
                    onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (hours)</label>
                  <input
                    type="number"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Fee ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admission Fee ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={courseForm.admissionFee}
                    onChange={(e) => setCourseForm({ ...courseForm, admissionFee: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Registration Fee ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={courseForm.registrationFee}
                    onChange={(e) => setCourseForm({ ...courseForm, registrationFee: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exam Fee ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={courseForm.examFee}
                    onChange={(e) => setCourseForm({ ...courseForm, examFee: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instructor</label>
                  <input
                    type="text"
                    value={courseForm.instructor}
                    onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Students</label>
                  <input
                    type="number"
                    value={courseForm.maxStudents}
                    onChange={(e) => setCourseForm({ ...courseForm, maxStudents: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Materials</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newMaterial}
                    onChange={(e) => setNewMaterial(e.target.value)}
                    placeholder="Add material..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addMaterial();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addMaterial}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                {courseForm.materials.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                    {courseForm.materials.map((material, index) => (
                      <div key={index} className="flex items-center justify-between py-1">
                        <span className="text-sm text-gray-700">• {material}</span>
                        <button
                          type="button"
                          onClick={() => removeMaterial(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={courseForm.status}
                  onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value as Course['status'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCourseForm(false);
                    setEditingCourse(null);
                    resetCourseForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingCourse ? 'Update Course' : 'Add Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Form Modal */}
      {showBatchForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingBatch ? 'Edit Batch' : 'Add New Batch'}
            </h2>
            <form onSubmit={handleBatchSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                  <select
                    value={batchForm.courseId}
                    onChange={(e) => setBatchForm({ ...batchForm, courseId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.filter(c => c.status === 'active').map(course => (
                      <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Batch Name</label>
                  <input
                    type="text"
                    value={batchForm.batchName}
                    onChange={(e) => setBatchForm({ ...batchForm, batchName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={batchForm.startDate}
                    onChange={(e) => setBatchForm({ ...batchForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={batchForm.endDate}
                    onChange={(e) => setBatchForm({ ...batchForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Students</label>
                  <input
                    type="number"
                    value={batchForm.maxStudents}
                    onChange={(e) => setBatchForm({ ...batchForm, maxStudents: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={batchForm.status}
                    onChange={(e) => setBatchForm({ ...batchForm, status: e.target.value as CourseBatch['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
                <input
                  type="text"
                  value={batchForm.schedule}
                  onChange={(e) => setBatchForm({ ...batchForm, schedule: e.target.value })}
                  placeholder="e.g., Mon, Wed, Fri 10:00 AM - 12:00 PM"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowBatchForm(false);
                    setEditingBatch(null);
                    resetBatchForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {editingBatch ? 'Update Batch' : 'Add Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Form Modal */}
      {showStudentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </h2>
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={studentForm.dateOfBirth}
                    onChange={(e) => setStudentForm({ ...studentForm, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                  <input
                    type="tel"
                    value={studentForm.emergencyContact}
                    onChange={(e) => setStudentForm({ ...studentForm, emergencyContact: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  value={studentForm.address}
                  onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowStudentForm(false);
                    setEditingStudent(null);
                    resetStudentForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  {editingStudent ? 'Update Student' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enrollment Form Modal */}
      {showEnrollmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">New Student Enrollment</h2>
            <form onSubmit={handleEnrollmentSubmit} className="space-y-6">
              {/* Student and Course Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                  <select
                    value={enrollmentForm.studentId}
                    onChange={(e) => setEnrollmentForm({ ...enrollmentForm, studentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Student</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>{student.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                  <select
                    value={enrollmentForm.courseId}
                    onChange={(e) => {
                      setEnrollmentForm({ ...enrollmentForm, courseId: e.target.value, batchId: '' });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.filter(c => c.status === 'active').map(course => (
                      <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch</label>
                <select
                  value={enrollmentForm.batchId}
                  onChange={(e) => setEnrollmentForm({ ...enrollmentForm, batchId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={!enrollmentForm.courseId}
                >
                  <option value="">Select Batch</option>
                  {courseBatches
                    .filter(batch => batch.courseId === enrollmentForm.courseId && batch.status !== 'completed')
                    .map(batch => (
                      <option key={batch.id} value={batch.id}>
                        {batch.batchName} ({batch.currentStudents}/{batch.maxStudents} students)
                      </option>
                    ))}
                </select>
              </div>

              {/* Fee Structure */}
              {enrollmentForm.courseId && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Fee Structure</h3>
                  {(() => {
                    const course = courses.find(c => c.id === enrollmentForm.courseId);
                    if (!course) return null;
                    
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Course Fee</span>
                          <span className="font-semibold text-green-600">${course.price.toFixed(2)}</span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={enrollmentForm.includeAdmissionFee}
                                onChange={(e) => setEnrollmentForm({ 
                                  ...enrollmentForm, 
                                  includeAdmissionFee: e.target.checked 
                                })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-gray-700">Admission Fee</span>
                            </label>
                            <span className="font-semibold text-blue-600">${course.admissionFee.toFixed(2)}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={enrollmentForm.includeRegistrationFee}
                                onChange={(e) => setEnrollmentForm({ 
                                  ...enrollmentForm, 
                                  includeRegistrationFee: e.target.checked 
                                })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-gray-700">Registration Fee</span>
                            </label>
                            <span className="font-semibold text-purple-600">${course.registrationFee.toFixed(2)}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={enrollmentForm.includeExamFee}
                                onChange={(e) => setEnrollmentForm({ 
                                  ...enrollmentForm, 
                                  includeExamFee: e.target.checked 
                                })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-gray-700">Exam Fee</span>
                            </label>
                            <span className="font-semibold text-orange-600">${course.examFee.toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <div className="border-t pt-3">
                          <div className="flex items-center justify-between text-lg font-bold">
                            <span className="text-gray-900">Total Fee</span>
                            <span className="text-blue-600">${calculateEnrollmentTotalFee().toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Initial Payment */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Initial Payment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={calculateEnrollmentTotalFee()}
                      value={enrollmentForm.initialPayment}
                      onChange={(e) => setEnrollmentForm({ 
                        ...enrollmentForm, 
                        initialPayment: parseFloat(e.target.value) || 0 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                    <select
                      value={enrollmentForm.paymentMethod}
                      onChange={(e) => setEnrollmentForm({ 
                        ...enrollmentForm, 
                        paymentMethod: e.target.value as CoursePayment['paymentMethod'] 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>
                </div>
                
                {enrollmentForm.initialPayment > 0 && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <div className="flex justify-between text-sm">
                      <span>Paying Now:</span>
                      <span className="font-semibold text-green-600">
                        ${enrollmentForm.initialPayment.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Remaining:</span>
                      <span className="font-semibold text-red-600">
                        ${(calculateEnrollmentTotalFee() - enrollmentForm.initialPayment).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEnrollmentForm(false);
                    resetEnrollmentForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Form Modal */}
      {(showPaymentForm || showPaymentModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {showPaymentModal ? 'Make Payment' : 'Add Payment'}
            </h2>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              {!showPaymentModal && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                    <select
                      value={paymentForm.studentId}
                      onChange={(e) => {
                        const studentId = e.target.value;
                        const studentEnrollments = enrollments.filter(en => en.studentId === studentId);
                        setPaymentForm({ 
                          ...paymentForm, 
                          studentId,
                          enrollmentId: studentEnrollments.length > 0 ? studentEnrollments[0].id : ''
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Student</option>
                      {students.map(student => (
                        <option key={student.id} value={student.id}>{student.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Enrollment</label>
                    <select
                      value={paymentForm.enrollmentId}
                      onChange={(e) => setPaymentForm({ ...paymentForm, enrollmentId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={!paymentForm.studentId}
                    >
                      <option value="">Select Enrollment</option>
                      {enrollments
                        .filter(enrollment => enrollment.studentId === paymentForm.studentId)
                        .map(enrollment => (
                          <option key={enrollment.id} value={enrollment.id}>
                            {getCourseName(enrollment.courseId)} - {getBatchName(enrollment.batchId)}
                          </option>
                        ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                <select
                  value={paymentForm.paymentType}
                  onChange={(e) => setPaymentForm({ 
                    ...paymentForm, 
                    paymentType: e.target.value as CoursePayment['paymentType'] 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={showPaymentModal}
                >
                  <option value="enrollment">Enrollment Fee</option>
                  <option value="registration">Registration Fee</option>
                  <option value="exam">Exam Fee</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ 
                    ...paymentForm, 
                    amount: parseFloat(e.target.value) || 0 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ 
                    ...paymentForm, 
                    paymentMethod: e.target.value as CoursePayment['paymentMethod'] 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Received By</label>
                <input
                  type="text"
                  value={paymentForm.receivedBy}
                  onChange={(e) => setPaymentForm({ ...paymentForm, receivedBy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentForm(false);
                    setShowPaymentModal(false);
                    setSelectedEnrollment(null);
                    resetPaymentForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Process Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}