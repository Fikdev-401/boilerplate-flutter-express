import 'package:bloc/bloc.dart';
import 'package:feruangayah/presentation/pages/bloc/auth/login/login_event.dart';
import 'package:feruangayah/presentation/pages/bloc/auth/login/login_state.dart';
import 'package:feruangayah/repositories/login_repository.dart';
import 'package:feruangayah/utils/session_manager.dart';

class LoginBloc extends Bloc<LoginEvent, LoginState> {
  final LoginRepository repository;
  final SessionManager sessionManager = SessionManager();
  bool _isSubmitting = false;

  LoginBloc(this.repository) : super(LoginInitial()) {
    on<LoginSubmitted>((event, emit) async {
      if (_isSubmitting) {
        return;
      }
      _isSubmitting = true;
      emit(LoginLoading());
      try {
        final result = await repository.login(event.request);
        await result.fold((error) async => emit(LoginFailed(error)), (user) async {
          await sessionManager.saveSession(user.token);
          emit(LoginSuccess(user));
        });
      } finally {
        _isSubmitting = false;
      }
    });

    on<LogoutPressed>((event, emit) async {
      await sessionManager.removeSession();
      emit(LoggedOut());
    });
  }
}
