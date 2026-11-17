import 'package:feruangayah/models/requests/login_request_model.dart';

abstract class LoginEvent {}

class LoginSubmitted  extends LoginEvent {
  final LoginRequestModel request;
  LoginSubmitted(this.request);
}

class LogoutPressed extends LoginEvent {}