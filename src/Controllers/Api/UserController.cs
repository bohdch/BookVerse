﻿using System;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using BookVerse.Services.Interfaces;
using BookVerse.Services.Interfaces;
using BookVerse.Models;

namespace BookVerse.Controllers.Api
{
    [Route("/api/users")]
    [ApiController]
    public class UserController : ControllerBase, IUserController
    {
        private readonly IUserManagerService _userManagerService;

        public UserController(IUserManagerService userManagerService)
        {
            _userManagerService = userManagerService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userManagerService.GetAllUsers();
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(string? id)
        {
            var user = await _userManagerService.GetUser(id);
            return Ok(user);
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] User user)
        {
            var createdUser = await _userManagerService.CreateUser(user);
            return Ok(createdUser);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateUser()
        {
            var user = await _userManagerService.UpdateUser(Request);
            return Ok(user);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string? id)
        {
            await _userManagerService.DeleteUser(id);
            return NoContent();
        }
    }
}
