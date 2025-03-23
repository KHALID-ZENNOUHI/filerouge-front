// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

// // Auth Components
// import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
// import { LoginComponent } from './pages/auth/login/login.component';
// import { RegisterComponent } from './pages/auth/register/register.component';
// import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
// import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password.component';

// Dashboard Component
// import { DashboardComponent } from './pages/dashboard/dashboard.component';

// Department Components
import { DepartmentListComponent } from './pages/departments/department-list/department-list.component';
import { LoginComponent } from './pages/login/login.component';
// import { DepartmentDetailComponent } from './pages/departments/department-detail/department-detail.component';

// Level Components
import { LevelListComponent } from './pages/levels/level-list/level-list.component';

// // Class Components
import { ClassListComponent } from './pages/classes/class-list/class-list.component';
import { ClassDetailComponent } from './pages/classes/class-detail/class-detail.component';
import { ClassFormComponent } from './pages/classes/class-form/class-form.component';
import { UserListComponent } from './pages/users/user-list/user-list.component';
import { UserProfileComponent } from './pages/users/user-profile/user-profile.component';
import { SubjectListComponent } from './pages/subjects/subject-list/subject-list.component';
import { ProgramListComponent } from './pages/programs/program-list/program-list.component';

// // Student Components
// import { StudentListComponent } from './features/students/student-list/student-list.component';
// import { StudentDetailComponent } from './features/students/student-detail/student-detail.component';

// // Teacher Components
// import { TeacherListComponent } from './features/teachers/teacher-list/teacher-list.component';
// import { TeacherDetailComponent } from './features/teachers/teacher-detail/teacher-detail.component';

// // Subject & Program Components
// import { SubjectListComponent } from './features/subjects/subject-list/subject-list.component';
// import { SubjectDetailComponent } from './features/subjects/subject-detail/subject-detail.component';
// import { ProgramListComponent } from './features/programs/program-list/program-list.component';

// // User Profile & Settings
// import { ProfileComponent } from './features/profile/profile.component';
// import { SettingsComponent } from './features/settings/settings.component';

// // Shared Components
// import { UnauthorizedComponent } from './shared/components/unauthorized/unauthorized.component';
// import { NotFoundComponent } from './shared/components/not-found/not-found.component';

export const routes: Routes = [
  // Default route
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  // Authentication routes
  {
    path: 'login',
    component: LoginComponent,
  },

  // Main application routes (protected)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      // Dashboard
    //   {
    //     path: 'dashboard',
    //     component: DashboardComponent,
    //     title: 'Dashboard - School Management System'
    //   },
    {
      path: 'users',
      children: [
        { 
          path: '', 
          component: UserListComponent,
          title: 'User Management - School Management System',
          data: { roles: ['ADMINISTRATOR'] }
        },
        { 
          path: ':id', 
          component: UserProfileComponent,
          title: 'User Profile - School Management System',
          data: { roles: ['ADMINISTRATOR'] }
        }
      ]
    },

      // Department routes
      {
        path: 'departments',
        children: [
          { 
            path: '', 
            component: DepartmentListComponent,
            title: 'Departments - School Management System',
            data: { roles: ['ADMINISTRATOR'] }
          },
        //   { 
        //     path: ':id', 
        //     component: DepartmentDetailComponent,
        //     title: 'Department Details - School Management System',
        //     data: { roles: ['ADMINISTRATOR'] }
        //   }
        ]
      },

      // Level routes
      {
        path: 'levels',
        children: [
          { 
            path: '', 
            component: LevelListComponent,
            title: 'Levels - School Management System',
            data: { roles: ['ADMINISTRATOR'] }
          }
        ]
      },

//       // Class routes
      {
        path: 'classes',
        children: [
          { 
            path: '', 
            component: ClassListComponent,
            title: 'Classes - School Management System',
            data: { roles: ['ADMINISTRATOR', 'TEACHER'] }
          },
          {
            path: 'create', 
            component: ClassFormComponent,
            title: 'Class Details - School Management System',
            data: { roles: ['ADMINISTRATOR', 'TEACHER'] }
          },
          { 
            path: ':id/edit', 
            component: ClassFormComponent,
            title: 'Class Details - School Management System',
            data: { roles: ['ADMINISTRATOR', 'TEACHER'] }
          },
          {
            path: ':id', 
            component: ClassDetailComponent,
            title: 'Class Details - School Management System',
            data: { roles: ['ADMINISTRATOR', 'TEACHER'] }
          }
        ]
      },

      
//       // Student routes
//       {
//         path: 'students',
//         children: [
//           { 
//             path: '', 
//             component: StudentListComponent,
//             title: 'Students - School Management System',
//             data: { roles: ['ADMINISTRATOR', 'TEACHER'] }
//           },
//           { 
//             path: ':id', 
//             component: StudentDetailComponent,
//             title: 'Student Details - School Management System',
//             data: { roles: ['ADMINISTRATOR', 'TEACHER', 'PARENT'] }
//           }
//         ]
//       },

//       // Teacher routes
//       {
//         path: 'teachers',
//         children: [
//           { 
//             path: '', 
//             component: TeacherListComponent,
//             title: 'Teachers - School Management System',
//             data: { roles: ['ADMINISTRATOR'] }
//           },
//           { 
//             path: ':id', 
//             component: TeacherDetailComponent,
//             title: 'Teacher Details - School Management System',
//             data: { roles: ['ADMINISTRATOR'] }
//           }
//         ]
//       },

      // Subject routes
      {
        path: 'subjects',
        children: [
          { 
            path: '', 
            component: SubjectListComponent,
            title: 'Subjects - School Management System',
            data: { roles: ['ADMINISTRATOR', 'TEACHER'] }
          },
          // { 
          //   path: ':id', 
          //   component: SubjectDetailComponent,
          //   title: 'Subject Details - School Management System',
          //   data: { roles: ['ADMINISTRATOR', 'TEACHER'] }
          // }
        ]
      },

//       // Program routes
      {
        path: 'programs',
        component: ProgramListComponent,
        title: 'Programs - School Management System',
        data: { roles: ['ADMINISTRATOR', 'TEACHER'] }
      },

//       // User Profile & Settings
//       {
//         path: 'profile',
//         component: ProfileComponent,
//         title: 'Profile - School Management System'
//       },
//       {
//         path: 'settings',
//         component: SettingsComponent,
//         title: 'Settings - School Management System',
//         data: { roles: ['ADMINISTRATOR'] }
//       }
//     ]
//   },

//   // Error pages
//   {
//     path: 'unauthorized',
//     component: UnauthorizedComponent,
//     title: 'Unauthorized - School Management System'
//   },
//   {
//     path: '**',
//     component: NotFoundComponent,
//     title: 'Page Not Found - School Management System'
]}
    
];