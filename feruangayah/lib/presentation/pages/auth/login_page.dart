import 'package:feruangayah/models/requests/login_request_model.dart';
import 'package:feruangayah/presentation/pages/bloc/auth/login/login_bloc.dart';
import 'package:feruangayah/presentation/pages/bloc/auth/login/login_event.dart';
import 'package:feruangayah/presentation/pages/bloc/auth/login/login_state.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  // Controller untuk mengambil nilai input dari form.
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isShowingErrorDialog = false;
  bool _isNavigating = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _submitLogin() {
    // Ambil nilai terbaru dari input user.
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    // Validasi sederhana: email dan password wajib diisi.
    if (email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Email dan password wajib diisi')),
      );
      return;
    }

    // Kirim event login ke BLoC agar diproses (API call, state update, dll).
    try {
      context.read<LoginBloc>().add(
            LoginSubmitted(
              LoginRequestModel(
                email: email,
                password: password,
              ),
            ),
          );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Terjadi masalah saat proses login')),
      );
    }
  }

  Future<void> _showLoginFailedAlert(BuildContext context, String message) async {
    if (_isShowingErrorDialog || !mounted) {
      return;
    }

    _isShowingErrorDialog = true;
    await showDialog<void>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Login Gagal'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('OK'),
          ),
        ],
      ),
    );
    _isShowingErrorDialog = false;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Login')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(
                labelText: 'Email',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _passwordController,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: 'Password',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            BlocConsumer<LoginBloc, LoginState>(
              listenWhen: (previous, current) =>
                  current is LoginSuccess || current is LoginFailed,
              listener: (context, state) {
                // Jika login berhasil, pindah ke halaman home.
                if (state is LoginSuccess) {
                  if (!mounted || _isNavigating) {
                    return;
                  }
                  _isNavigating = true;
                  Navigator.of(context)
                      .pushNamedAndRemoveUntil('/home', (route) => false)
                      .whenComplete(() => _isNavigating = false);
                // Jika gagal, tampilkan alert kredensial.
                } else if (state is LoginFailed) {
                  if (!mounted || ModalRoute.of(context)?.isCurrent != true) {
                    return;
                  }
                  _showLoginFailedAlert(context, state.error);
                }
              },
              buildWhen: (previous, current) =>
                  current is LoginInitial ||
                  current is LoginLoading ||
                  current is LoginFailed,
              builder: (context, state) {
                // Saat loading, tombol dinonaktifkan untuk mencegah submit berulang.
                final isLoading = state is LoginLoading;
                return ElevatedButton(
                  onPressed: isLoading ? null : _submitLogin,
                  child: isLoading
                      ? const SizedBox(
                          height: 18,
                          width: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Login'),
                );
              },
            ),
            TextButton(
              onPressed: () => Navigator.pushReplacementNamed(context, '/register'),
              child: const Text('Belum punya akun? Register'),
            ),
          ],
        ),
      ),
    );
  }
}
