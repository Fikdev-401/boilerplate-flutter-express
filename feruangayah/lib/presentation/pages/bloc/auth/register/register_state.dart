import 'package:feruangayah/models/responses/register_response_model.dart';

abstract class RegisterState {}

class RegisterInitial extends RegisterState {}

class RegisterLoading extends RegisterState {}

class RegisterSuccess extends RegisterState {
  final RegisterResponseModel response;
  RegisterSuccess(this.response);
}

class RegisterFailed extends RegisterState {
  final String error;
  RegisterFailed(this.error);
}