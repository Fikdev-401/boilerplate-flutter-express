
import 'package:feruangayah/models/responses/login_response_model.dart';

abstract class LoginState {}

class LoginInitial extends LoginState {}

class LoginLoading extends LoginState {}

class LoginSuccess extends LoginState {
  final LoginResponseModel response;
  LoginSuccess(this.response);
}

class LoginFailed extends LoginState {
  final String error;
  LoginFailed(this.error);
}

class LoggedOut extends LoginState {}