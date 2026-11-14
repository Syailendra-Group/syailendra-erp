# -*- coding: utf-8 -*-
from odoo import fields, models


class SyailendraSiteConfig(models.Model):
    _name = 'syailendra.site.config'
    _description = 'Syailendra Global Website & Theme Appearance Configuration'

    site_name = fields.Char(
        string='Website / Application Name',
        required=True,
        default='SYAILENDRA ERP',
        help='Main application title displayed on login and browser headers'
    )
    company_name = fields.Char(
        string='Business / Holding Group Name',
        default='Syailendra Group',
        help='Official business name displayed on footer notices and legal copyright lines'
    )
    site_descriptor = fields.Char(
        string='Platform Descriptor Badge',
        default='INTEGRATED BUSINESS MANAGEMENT PLATFORM',
        help='Corporate badge subtitle displayed below the main application name'
    )
    login_tagline = fields.Char(
        string='Login Tagline',
        default='Smarter Systems, Stronger Businesses.',
        help='Tagline displayed on the authentication screen'
    )
    login_card_title = fields.Char(
        string='Login Card Title',
        default='Sign In to System'
    )
    login_card_description = fields.Text(
        string='Login Card Description',
        default='Enter your authorized corporate email and password to access the platform.'
    )
    footer_backbone = fields.Char(
        string='Footer Backbone Text',
        default='A DIGITAL BACKBONE FOR THE SYAILENDRA GROUP MULTI-ENTITY ECOSYSTEM.'
    )
    copyright_text = fields.Char(
        string='Copyright Notice',
        default='All rights reserved.'
    )

    # Branding Logos stored in Native Odoo 18 Filestore (attachment=True)
    logo_light = fields.Binary(
        string='Primary Logo (Light Mode)',
        attachment=True
    )
    logo_dark = fields.Binary(
        string='Primary Logo (Dark Mode)',
        attachment=True
    )
    logo_monogram = fields.Binary(
        string='Monogram / Sidebar Icon Logo',
        attachment=True
    )

    # Dynamic Color Palette (Hex)
    primary_light = fields.Char(
        string='Primary Color (Light Mode)',
        default='#004e52',
        size=16
    )
    primary_dark = fields.Char(
        string='Primary Color (Dark Mode)',
        default='#008187',
        size=16
    )
    bg_light = fields.Char(
        string='Background Canvas (Light Mode)',
        default='#fffdee',
        size=16
    )
    bg_dark = fields.Char(
        string='Background Canvas (Dark Mode)',
        default='#181c20',
        size=16
    )
    accent_gold = fields.Char(
        string='Corporate Accent Gold',
        default='#e8ae1e',
        size=16
    )
