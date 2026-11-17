import 'package:feruangayah/presentation/pages/auth/login_page.dart';
import 'package:feruangayah/presentation/pages/auth/register_page.dart';
import 'package:feruangayah/presentation/pages/bloc/auth/login/login_bloc.dart';
import 'package:feruangayah/presentation/pages/bloc/auth/register/register_bloc.dart';
import 'package:feruangayah/presentation/pages/home/main_page.dart';
import 'package:feruangayah/presentation/widgets/splash.dart';
import 'package:feruangayah/repositories/login_repository.dart';
import 'package:feruangayah/repositories/register_repository.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (context) => LoginBloc(LoginRepository())),
        BlocProvider(create: (context) => RegisterBloc(RegisterRepository())),
      ],
      child: MaterialApp(
        title: 'Ruang Ayah',
        debugShowCheckedModeBanner: false,
        home: const Splash(),
        routes: {
          '/login': (context) => const LoginPage(),
          '/register': (context) => const RegisterPage(),
          '/home': (context) => const MainPage(),
        },
      ),
    );
  }
}
