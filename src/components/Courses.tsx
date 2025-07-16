import React, { useState } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { 
  Plus, Search, Edit2, Trash2, Users, BookOpen, Calendar, 
  CreditCard, User, GraduationCap, CheckCircle, XCircle, 
  Eye, Download, Clock, DollarSign
} from 'lucide-react';
import { Course, CourseBatch, Student, Enrollment, CoursePayment } from '../types';

export function Courses() {
  const { 
    courses, courseBatches, students, enrollments, coursePayments,
    addCourse, updateCourse, deleteCourse,
    addCourseBatch, updateCourseBatch, deleteCourseBatch,
    addStudent, updateStudent, deleteStudent,
    addEnrollment, updateEnrollment, deleteEnrollment,
    addCoursePayment, updateCoursePayment, deleteCoursePayment,
    generatePaymentVoucher
  } = useInventory();

  const [activeTab, setActiveTab] = useState<'courses' | 'batches' | 'students' | 'enrollments' | 'payments'>('courses');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Course states
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
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

  // Batch states
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [editingBatch, setEditingBatch] = useState<CourseBatch | null>(null);
  const [batchForm, setBatchForm] = useState({
    courseId: '',
    batchName: '',
    startDate: '',
    endDate: '',
    schedule: '',
    maxStudents: 0,
    status: 'upcoming' as CourseBatch['status']
  });

  // Student states
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    emergencyContact: ''
  });

  // Enrollment states
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [enrollmentForm, setEnrollmentForm] = useState({
    studentId: '',
    courseId: '',
    batchId: '',
    totalFee: 0,
    paidAmount: 0,
    remainingAmount: 0,
    status: 'active' as Enrollment['status']
  });

  // Payment states
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    enrollmentId: '',
    studentId: '',
    paymentType: 'enrollment' as CoursePayment['paymentType'],
    amount: 0,
    paymentMethod: 'cash' as CoursePayment['paymentMethod'],
    paymentDate: new Date().toISOString().split('T')[0],
    voucherNumber: '',
    description: '',
    receivedBy: 'Admin'
  });

  const [newMaterial, setNewMaterial] = useState('');
  const [showVoucherModal, setShowVoucherModal] = useState<CoursePayment | null>(null);

  // Filter functions
  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBatches = courseBatches.filter(batch => {
    const course = courses.find(c => c.id === batch.courseId);
    return course?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           batch.batchName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phone.includes(searchTerm)
  );

  const filteredEnrollments = enrollments.filter(enrollment => {
    const student = students.find(s => s.id === enrollment.studentId);
    const course = courses.find(c => c.id === enrollment.courseId);
    return student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           course?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredPayments = coursePayments.filter(payment => {
    const student = students.find(s => s.id === payment.studentId);
    return student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           payment.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Helper functions
  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : 'Unknown Course';
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown Student';
  };

  const getBatchName = (batchId: string) => {
    const batch = courseBatches.find(b => b.id === batchId);
    return batch ? batch.batchName : 'Unknown Batch';
  };

  // Course functions
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

  // Batch functions
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

  // Student functions
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

  // Enrollment functions
  const handleEnrollmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if student is already enrolled in this course
    const existingEnrollment = enrollments.find(enrollment => 
      enrollment.studentId === enrollmentForm.studentId && 
      enrollment.courseId === enrollmentForm.courseId
    );

    if (existingEnrollment) {
      alert('This student is already enrolled in this course. A student can only enroll in one batch per course.');
      return;
    }

    const course = courses.find(c => c.id === enrollmentForm.courseId);
    if (!course) return;

    const enrollmentData = {
      ...enrollmentForm,
      totalFee: course.price,
      paidAmount: 0,
      remainingAmount: course.price,
      admissionFeePaid: false,
      registrationFeePaid: false,
      examFeePaid: false
    };

    addEnrollment(enrollmentData);
    resetEnrollmentForm();
    setShowEnrollmentForm(false);
  };

  const resetEnrollmentForm = () => {
    setEnrollmentForm({
      studentId: '',
      courseId: '',
      batchId: '',
      totalFee: 0,
      paidAmount: 0,
      remainingAmount: 0,
      status: 'active'
    });
  };

  // Payment functions
  const handleMakePayment = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setPaymentForm({
      enrollmentId: enrollment.id,
      studentId: enrollment.studentId,
      paymentType: 'enrollment',
      amount: enrollment.remainingAmount,
      paymentMethod: 'cash',
      paymentDate: new Date().toISOString().split('T')[0],
      voucherNumber: `V-${Date.now()}`,
      description: '',
      receivedBy: 'Admin'
    });
    setShowPaymentForm(true);
  };

  const handlePaymentTypeChange = (paymentType: CoursePayment['paymentType']) => {
    if (!selectedEnrollment) return;

    const course = courses.find(c => c.id === selectedEnrollment.courseId);
    if (!course) return;

    let amount = 0;
    let description = '';

    switch (paymentType) {
      case 'admission':
        amount = selectedEnrollment.admissionFeePaid ? 0 : course.admissionFee;
        description = selectedEnrollment.admissionFeePaid ? 'This fee has already been paid' : 'Admission fee payment';
        break;
      case 'registration':
        amount = selectedEnrollment.registrationFeePaid ? 0 : course.registrationFee;
        description = selectedEnrollment.registrationFeePaid ? 'This fee has already been paid' : 'Registration fee payment';
        break;
      case 'exam':
        amount = selectedEnrollment.examFeePaid ? 0 : course.examFee;
        description = selectedEnrollment.examFeePaid ? 'This fee has already been paid' : 'Exam fee payment';
        break;
      case 'enrollment':
        amount = selectedEnrollment.remainingAmount;
        description = 'Course enrollment fee payment';
        break;
    }

    setPaymentForm({
      ...paymentForm,
      paymentType,
      amount,
      description
    });
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentForm.amount <= 0) {
      alert('Payment amount must be greater than 0');
      return;
    }

    addCoursePayment(paymentForm);
    setShowPaymentForm(false);
    setSelectedEnrollment(null);
    resetPaymentForm();
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      enrollmentId: '',
      studentId: '',
      paymentType: 'enrollment',
      amount: 0,
      paymentMethod: 'cash',
      paymentDate: new Date().toISOString().split('T')[0],
      voucherNumber: '',
      description: '',
      receivedBy: 'Admin'
    });
  };

  const approvePayment = (paymentId: string) => {
    // In a real application, you might want to add a status field to CoursePayment
    // For now, we'll just generate a voucher
    const payment = coursePayments.find(p => p.id === paymentId);
    if (payment) {
      generatePaymentVoucher(payment.voucherNumber);
      alert('Payment approved and voucher generated!');
    }
  };

  const declinePayment = (paymentId: string) => {
    if (window.confirm('Are you sure you want to decline this payment?')) {
      deleteCoursePayment(paymentId);
      alert('Payment declined and removed.');
    }
  };

  const viewVoucher = (payment: CoursePayment) => {
    setShowVoucherModal(payment);
  };

  const downloadVoucher = (payment: CoursePayment) => {
    const enrollment = enrollments.find(e => e.id === payment.enrollmentId);
    const student = students.find(s => s.id === payment.studentId);
    const course = enrollment ? courses.find(c => c.id === enrollment.courseId) : null;
    const batch = enrollment ? courseBatches.find(b => b.id === enrollment.batchId) : null;

    const voucherContent = `
      PAYMENT VOUCHER
      ================
      
      Voucher Number: ${payment.voucherNumber}
      Date: ${new Date(payment.paymentDate).toLocaleDateString()}
      
      Student: ${student?.name || 'Unknown'}
      Course: ${course?.name || 'Unknown'}
      Batch: ${batch?.batchName || 'Unknown'}
      
      Payment Type: ${payment.paymentType.charAt(0).toUpperCase() + payment.paymentType.slice(1)}
      Amount: $${payment.amount.toFixed(2)}
      Payment Method: ${payment.paymentMethod.charAt(0).toUpperCase() + payment.paymentMethod.slice(1)}
      
      Received By: ${payment.receivedBy}
      
      Description: ${payment.description || 'N/A'}
      
      Thank you for your payment!
    `;

    const blob = new Blob([voucherContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `voucher-${payment.voucherNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
        <p className="text-gray-600 mt-2">Manage courses, batches, students, enrollments, and payments</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="flex border-b">
          {[
            { id: 'courses', label: 'Courses', icon: BookOpen },
            { id: 'batches', label: 'Batches', icon: Calendar },
            { id: 'students', label: 'Students', icon: Users },
            { id: 'enrollments', label: 'Enrollments', icon: GraduationCap },
            { id: 'payments', label: 'Payments', icon: CreditCard }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 font-medium ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Courses</h2>
            <button
              onClick={() => setShowCourseForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              <span>Add Course</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Course Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Duration</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Price</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Instructor</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Max Students</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{course.name}</p>
                          <p className="text-sm text-gray-600">{course.description}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">{course.duration} hours</td>
                      <td className="py-3 px-4">${course.price}</td>
                      <td className="py-3 px-4">{course.instructor}</td>
                      <td className="py-3 px-4">{course.maxStudents}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {course.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Batches Tab */}
      {activeTab === 'batches' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Course Batches</h2>
            <button
              onClick={() => setShowBatchForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              <span>Add Batch</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Batch Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Course</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Schedule</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Duration</th>
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
                      <td className="py-3 px-4">{batch.schedule}</td>
                      <td className="py-3 px-4">
                        {new Date(batch.startDate).toLocaleDateString()} - {new Date(batch.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">{batch.currentStudents}/{batch.maxStudents}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          batch.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                          batch.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                          batch.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
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
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Students</h2>
            <button
              onClick={() => setShowStudentForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              <span>Add Student</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <div key={student.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                    <p className="text-sm text-gray-500">
                      Joined {new Date(student.createdAt).toLocaleDateString()}
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
                  {student.address && (
                    <p className="text-sm text-gray-600">{student.address}</p>
                  )}
                  {student.emergencyContact && (
                    <p className="text-sm text-gray-600">Emergency: {student.emergencyContact}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enrollments Tab */}
      {activeTab === 'enrollments' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Enrollments</h2>
            <button
              onClick={() => setShowEnrollmentForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              <span>Add Enrollment</span>
            </button>
          </div>

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
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEnrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">{getStudentName(enrollment.studentId)}</td>
                      <td className="py-3 px-4">{getCourseName(enrollment.courseId)}</td>
                      <td className="py-3 px-4">{getBatchName(enrollment.batchId)}</td>
                      <td className="py-3 px-4">${enrollment.totalFee.toFixed(2)}</td>
                      <td className="py-3 px-4">${enrollment.paidAmount.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${
                          enrollment.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          ${enrollment.remainingAmount.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          enrollment.status === 'active' ? 'bg-green-100 text-green-800' :
                          enrollment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          enrollment.status === 'dropped' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleMakePayment(enrollment)}
                            className="text-green-600 hover:text-green-800"
                            title="Make Payment"
                          >
                            <CreditCard size={16} />
                          </button>
                          <button
                            onClick={() => deleteEnrollment(enrollment.id)}
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
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Course Payments</h2>
          </div>

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
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{payment.voucherNumber}</td>
                      <td className="py-3 px-4">{getStudentName(payment.studentId)}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {payment.paymentType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">${payment.amount.toFixed(2)}</td>
                      <td className="py-3 px-4 capitalize">{payment.paymentMethod}</td>
                      <td className="py-3 px-4">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => approvePayment(payment.id)}
                            className="text-green-600 hover:text-green-800"
                            title="Approve Payment"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => declinePayment(payment.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Decline Payment"
                          >
                            <XCircle size={16} />
                          </button>
                          <button
                            onClick={() => viewVoucher(payment)}
                            className="text-blue-600 hover:text-blue-800"
                            title="View Voucher"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => downloadVoucher(payment)}
                            className="text-purple-600 hover:text-purple-800"
                            title="Download Voucher"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Price</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admission Fee</label>
                  <input
                    type="number"
                    step="0.01"
                    value={courseForm.admissionFee}
                    onChange={(e) => setCourseForm({ ...courseForm, admissionFee: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Registration Fee</label>
                  <input
                    type="number"
                    step="0.01"
                    value={courseForm.registrationFee}
                    onChange={(e) => setCourseForm({ ...courseForm, registrationFee: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exam Fee</label>
                  <input
                    type="number"
                    step="0.01"
                    value={courseForm.examFee}
                    onChange={(e) => setCourseForm({ ...courseForm, examFee: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <div className="bg-gray-50 rounded-lg p-3">
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingBatch ? 'Edit Batch' : 'Add New Batch'}
            </h2>
            <form onSubmit={handleBatchSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                <select
                  value={batchForm.courseId}
                  onChange={(e) => setBatchForm({ ...batchForm, courseId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map(course => (
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </h2>
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  value={studentForm.address}
                  onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
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
                  type="text"
                  value={studentForm.emergencyContact}
                  onChange={(e) => setStudentForm({ ...studentForm, emergencyContact: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Enrollment</h2>
            <form onSubmit={handleEnrollmentSubmit} className="space-y-4">
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
                  onChange={(e) => setEnrollmentForm({ ...enrollmentForm, courseId: e.target.value, batchId: '' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
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
                    .filter(batch => batch.courseId === enrollmentForm.courseId)
                    .map(batch => (
                      <option key={batch.id} value={batch.id}>{batch.batchName}</option>
                    ))}
                </select>
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && selectedEnrollment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Make Payment</h2>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Student: <span className="font-medium">{getStudentName(selectedEnrollment.studentId)}</span></p>
              <p className="text-sm text-gray-600">Course: <span className="font-medium">{getCourseName(selectedEnrollment.courseId)}</span></p>
              <p className="text-sm text-gray-600">Batch: <span className="font-medium">{getBatchName(selectedEnrollment.batchId)}</span></p>
            </div>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                <select
                  value={paymentForm.paymentType}
                  onChange={(e) => handlePaymentTypeChange(e.target.value as CoursePayment['paymentType'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="admission">Admission Fee</option>
                  <option value="registration">Registration Fee</option>
                  <option value="exam">Exam Fee</option>
                  <option value="enrollment">Enrollment Fee</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly={paymentForm.paymentType !== 'enrollment'}
                  required
                />
                {paymentForm.description && (
                  <p className="text-xs text-gray-500 mt-1">{paymentForm.description}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as CoursePayment['paymentMethod'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
                <input
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Voucher Number</label>
                <input
                  type="text"
                  value={paymentForm.voucherNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, voucherNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
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
                    setSelectedEnrollment(null);
                    resetPaymentForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Process Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Voucher View Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">Payment Voucher</h2>
              <button
                onClick={() => setShowVoucherModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="border-b pb-3">
                <p className="font-medium">Voucher Number: {showVoucherModal.voucherNumber}</p>
                <p className="text-gray-600">Date: {new Date(showVoucherModal.paymentDate).toLocaleDateString()}</p>
              </div>
              
              <div>
                <p><span className="font-medium">Student:</span> {getStudentName(showVoucherModal.studentId)}</p>
                <p><span className="font-medium">Payment Type:</span> {showVoucherModal.paymentType.charAt(0).toUpperCase() + showVoucherModal.paymentType.slice(1)}</p>
                <p><span className="font-medium">Amount:</span> ${showVoucherModal.amount.toFixed(2)}</p>
                <p><span className="font-medium">Method:</span> {showVoucherModal.paymentMethod.charAt(0).toUpperCase() + showVoucherModal.paymentMethod.slice(1)}</p>
                <p><span className="font-medium">Received By:</span> {showVoucherModal.receivedBy}</p>
              </div>
              
              {showVoucherModal.description && (
                <div className="border-t pt-3">
                  <p><span className="font-medium">Description:</span> {showVoucherModal.description}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => downloadVoucher(showVoucherModal)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Download size={16} />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}