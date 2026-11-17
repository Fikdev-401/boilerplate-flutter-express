class RegisterRequestModel {
  final String name;
  final String email;
  final String password;
  final String? confirmPassword;

  RegisterRequestModel({
    required this.name,
    required this.email,
    required this.password,
    this.confirmPassword,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'email': email,
      'password': password,
      'password_confirmation': confirmPassword,
    };
  }
}