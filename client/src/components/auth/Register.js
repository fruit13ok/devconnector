import React, { Component } from 'react';
import axios from 'axios';
import classnames from 'classnames';

class Register extends Component {
    // create states
    constructor() {
        super();
        this.state = {
          name: '',
          email: '',
          password: '',
          password2: '',
          errors: {}
        };
        // bind 'this' to onChange() so it know what this.state is
        // this.onChange = this.onChange.bind(this);
        // this.onSubmit = this.onSubmit.bind(this);
    }
    
    // whenever user type on input will update state variable
    // EX:
    // ["name"]: e.target.value
    // ["email"]: e.target.value
    // ["password"]: e.target.value
    // ...
    // onChange(e) {
    //     this.setState({ [e.target.name]: e.target.value });
    // }
    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }
    onSubmit = (e) => {
        e.preventDefault();
    
        const newUser = {
          name: this.state.name,
          email: this.state.email,
          password: this.state.password,
          password2: this.state.password2
        };
        // console.log(newUser);
        // we don't write http://localhost:5000/api/users/register because we used proxy,
        // our backend register route will send back the registered user or error
        // NOTE: I added setState to errors to empty it out on request success,
        // it fixed when enter correct data after wrong data errors is not empty.
        axios.post('/api/users/register', newUser)
            .then(res => {console.log(res.data); this.setState({ errors: {} });})
            .catch(err => this.setState({ errors: err.response.data }));
      }
  render() {
    // destructuring way
    // const { errors } = this.state;
    // normal way
    const errors = this.state.errors;

    return (
        <div className="register">
        <div className="container">
          <div className="row">
            <div className="col-md-8 m-auto">
              <h1 className="display-4 text-center">Sign Up</h1>
              <p className="lead text-center">Create your DevConnector account</p>
              {/* use noValidate to turn off html validation, just use our validation */}
              <form noValidate onSubmit={this.onSubmit}>
                <div className="form-group">
                  <input 
                  type="text" 
                //   className="form-control form-control-lg" 
                // use classnames here
                // first argument is classes always apply
                // second argument is classes only apply if condition is true
                // condition is errors.name, come from state,
                // after request to backend errors object will be fill,
                // if name is missing error.name will be create by validation/register.js 
                // className={classnames('form-control form-control-lg', {
                //     'is-invalid': errors.name
                //   })}
                // this is use ternary operator
                  className={errors.name ? 'form-control form-control-lg is-invalid' : 'form-control form-control-lg'}
                  placeholder="Name" 
                  name="name" 
                  value={this.state.name} 
                  onChange={this.onChange}
                  />
                  {/* 
                    this is use truthy && operator,
                    if has errors.name, add the <div>
                 */}
                  {/* {errors.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )} */}
                  {/* this is use ternary operator, with null as else */}
                  {errors.name ? (
                    <div className="invalid-feedback">{errors.name}</div>
                  ): null}
                </div>
                <div className="form-group">
                  <input 
                  type="email" 
                //   className="form-control form-control-lg" 
                className={errors.email ? 'form-control form-control-lg is-invalid' : 'form-control form-control-lg'}
                  placeholder="Email Address" name="email" 
                  value={this.state.email} 
                  onChange={this.onChange}
                  />
                  {errors.email ? (
                    <div className="invalid-feedback">{errors.email}</div>
                  ): null}
                  <small className="form-text text-muted">This site uses Gravatar so if you want a profile image, use a Gravatar email</small>
                </div>
                <div className="form-group">
                  <input 
                  type="password" 
                //   className="form-control form-control-lg" 
                className={errors.password ? 'form-control form-control-lg is-invalid' : 'form-control form-control-lg'}
                  placeholder="Password" 
                  name="password" 
                  value={this.state.password} 
                  onChange={this.onChange}
                  />
                  {errors.password ? (
                    <div className="invalid-feedback">{errors.password}</div>
                  ): null}
                </div>
                <div className="form-group">
                  <input 
                  type="password" 
                //   className="form-control form-control-lg" 
                className={errors.password2 ? 'form-control form-control-lg is-invalid' : 'form-control form-control-lg'}
                  placeholder="Confirm Password" 
                  name="password2" 
                  value={this.state.password2} 
                  onChange={this.onChange}
                  />
                  {errors.password2 ? (
                    <div className="invalid-feedback">{errors.password2}</div>
                  ): null}
                </div>
                <input type="submit" className="btn btn-info btn-block mt-4" />
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Register;
