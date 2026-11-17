import 'package:bloc/bloc.dart';
import 'package:feruangayah/presentation/pages/bloc/auth/register/register_event.dart';
import 'package:feruangayah/presentation/pages/bloc/auth/register/register_state.dart';
import 'package:feruangayah/repositories/register_repository.dart';
import 'package:feruangayah/utils/session_manager.dart';

class RegisterBloc extends Bloc<RegisterEvent, RegisterState> {
  final RegisterRepository repository;
  final SessionManager sessionManager = SessionManager();
  RegisterBloc(this.repository) : super(RegisterInitial()) {
    on<RegisterSubmitEvent>((event, emit) async {
      emit(RegisterLoading());
      final result = await repository.register(event.request);
      result.fold((error) => emit(RegisterFailed(error)), (response) {
        sessionManager.saveSession(response.token);
        emit(RegisterSuccess(response));
      });
    });
  }
}
