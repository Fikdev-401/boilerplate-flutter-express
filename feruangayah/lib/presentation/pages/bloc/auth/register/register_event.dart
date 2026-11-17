import 'package:feruangayah/models/requests/register_request_model.dart';

abstract class RegisterEvent {}

class RegisterSubmitEvent extends RegisterEvent {
  final RegisterRequestModel request;
  RegisterSubmitEvent(this.request);
}