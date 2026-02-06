// Version 3 MVC PHP template – pasted code is inserted at <!-- INSERT CODE HERE -->

export const V3_FORM_PLACEHOLDER = '<!-- INSERT CODE HERE -->'
export const V3_VALIDATION_PLACEHOLDER = '// INSERT FORM VALIDATION CODE HERE'
export const FORM_NAME_PLACEHOLDER = '<!--FORM_NAME-->'
export const POST_NAME_KEY_PLACEHOLDER = '<!--POST_NAME_KEY-->'
export const POST_NAME_EMPTY_CHECK_PLACEHOLDER = '<!--POST_NAME_EMPTY_CHECK-->'
export const POST_NAME_BUILD_PLACEHOLDER = '<!--POST_NAME_BUILD-->'
export const DOCU_ELSEIF_BLOCKS_PLACEHOLDER = '<!-- DOCU_ELSEIF_BLOCKS -->'

export const version3_mvcTemplate = `<?php

defined('ACCESSIBLE') or exit('No direct script access allowed');
@session_start();

$formname = '<!--FORM_NAME-->';
$prompt_message = '<span class="required-info">* Required Information</span>';

if ($_POST) {

	$result_recaptcha = Main::recaptcha($recaptcha_privite, $_POST);

	if( <!--POST_NAME_EMPTY_CHECK--> 
		) {


		$asterisk = '<span style="color:#FF0000; font-weight:bold;">*&nbsp;</span>';
		$prompt_message = '<div id="error-msg"><div class="message"><span>Failed to send email. Please try again.</span><br/><p class="error-close">x</p></div></div>';
	} else if (!preg_match("/^[_\.0-9a-zA-Z-]+@([0-9a-zA-Z][0-9a-zA-Z-]+\.)+[a-zA-Z]{2,6}$/i", stripslashes(trim($_POST['Email_Address'])))) {
		$prompt_message = '<div id="recaptcha-error"><div class="message"><span>Please enter a valid email address</span><br/><p class="rclose">x</p></div></div>';
	} else if (!$result_recaptcha->success) {
		$prompt_message = '<div id="recaptcha-error"><div class="message"><span>Invalid <br>Recaptcha</span><p class="rclose">x</p></div></div>';
	} else {

		if (MAIL_TYPE == 1) {
			$formdisclaimer = '<div style="position: relative; top: 10px; background: #eef5f8; padding: 15px 20px; border-radius: 5px; width: 660px; margin: 0 auto; text-align: center; font-family: Poppins,sans-serif; border: 1px solid #f9f9f9;  color: #6a6a6a !important;">  
					<span style="border-radius: 50%; height: 19px; display: inline-block; color: #f49d2c; font-size: 15px;   text-align: center;"></span> Please do not reply to this email. This is only a notification from your website online forms. 
					<br>To contact the person who filled out your online form, kindly use the email which is inside the form below.</div>';
		} else
			$formdisclaimer = '';


		$body = '
		
		<div class="form_table" style="width:700px; height:auto; font-size:12px; color:#6a6a6a; letter-spacing:1px; margin: 0 auto; font-family: Poppins,sans-serif;">' . $formdisclaimer . '
		<div class="container" style="background: #fff; margin-top: 30px; font-family: Poppins,sans-serif; color:#6a6a6a; box-shadow: 10px 10px 31px -7px rgba(38,38,38,0.11); -webkit-box-shadow: 10px 10px 31px -7px rgba(38,38,38,0.11); -moz-box-shadow: 10px 10px 31px -7px rgba(38,38,38,0.11);  border-radius: 5px 5px 5px 5px; border: 1px solid #eee;">
			<div class="header" style="background: #a3c7d6; padding: 30px; border-radius: 5px 5px 0px 0px; ">
				<div align="left" style="font-size:22px; font-family: Poppins,sans-serif; color:#fff; font-weight: 900;">' . $formname . '</div>
				<div align="left" style=" color: #11465E;  font-size:19px; font-family: Poppins,sans-serif;  font-style: italic; margin-top: 6px; font-weight: 900;">' . COMP_NAME . '</div>
			</div>
		<div style="padding: 13px 30px 25px 30px;">
		<table border="0" cellpadding="0" cellspacing="0" width="100%" align="center" style="font-family: Poppins,sans-serif;font-size:14px; padding-bottom: 20px;"> 

					';
		foreach ($_POST as $key => $value) {
			if ($key == 'secode')
				continue;
			elseif ($key == 'submit')
				continue;
			elseif ($key == 'g-recaptcha-response')
				continue;

			if (!empty($value)) {
				$key2 = str_replace('_', ' ', $key);
				if ($value == ':') {
					$body .= ' <tr margin-bottom="10px"> <td colspan="5" height="28" class="OFDPHeading" width="100%" style=" background:#F0F0F0; margin-bottom:5px;"><b style="padding-left: 4px;">' . $key2 . '</b></td></tr>';
					}else if ($key == "Privacy_Policy") {
						$body .= '<tr><td colspan="3" style="line-height:30px">
						<style>span.light-grey {color: #949191 !important;}</style>
				<span class="light-grey">Evidence of Consent:<br/>
                        [Checkbox Checked] I consent to the collection, use, storage, and processing of my personal and, where applicable, health-related information, including any data I submit on behalf of others, for the purpose of evaluating or fulfilling my request made through this form. I understand this will be handled in accordance with the Privacy Notice.<br><br>
						
						Form Version: V3.0-091025</span>
					</td></tr>';
				
				<!-- DOCU_ELSEIF_BLOCKS -->
				} else {
					$body .= '<tr><td class="Values1"colspan="2" height="28" align="left" width="40%" padding="100" style="line-height: normal; padding-left: 4px;text-justify: inter-word; word-wrap: anywhere; padding-right: 28px;">
								<span style="position:relative !important;"><b>' . $key2 . '</b></span >:</td> <td class="Values2"colspan="2" height="28" align="left" width="50%" padding="10" style="line-height: normal; word-wrap: anywhere; "><span style="margin-top: 7px; position:relative;margin-left: 7px; border-collapse: collapse; display: inline-block;margin-bottom: 5px;margin-right: 7px;">' . htmlspecialchars(trim($value), ENT_QUOTES) . '</span> </td></tr>';
				}
			}
		}
		$body .= '
					</table>
					</div>
					</div>';

// save data form on database
		$subject = $formname;
		$attachments = array();

		   // when form has attachments, uncomment code below
   		if(!empty($_FILES['attachment']['name'])){
            $attachmentsdir = ABSPATH.'onlineforms/attachments/';
            $validextensions = array('pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'zip', 'rar'); // include file type here
            for($i = 0 ; $i < count($_FILES['attachment']['name']) ; $i++ ){

                $checkfile =  $attachmentsdir.$_FILES['attachment']['name'][$i];
                //$tobeuploadfile = $_FILES['attachment']['tmp_name'][$i];
                $tempfile = pathinfo($_FILES['attachment']['name'][$i]);
                if(in_array(strtolower($tempfile['extension']), $validextensions)){
                    if(file_exists($checkfile)){
                        $storedfile = $tempfile['filename'].'-'.time().'.'.$tempfile['extension'];
                    }else{
                        $storedfile = $_FILES['attachment']['name'][$i];
                    }

                    if( move_uploaded_file($_FILES['attachment']['tmp_name'][$i], $attachmentsdir.$storedfile) ){
                        $attachments[] = $storedfile;
                    }
                }
            }
        }

		//name of sender
		<!--POST_NAME_BUILD-->
		$result = insertDB($name, $subject, $body, $attachments);

		$parameter = array(
			'body' => $body,
			'from' => $from_email,
			'from_name' => $from_name,
			'to' => $to_email,
			'subject' => 'New Message Notification',
			'attachment' => $attachments
		);

		$prompt_message = send_email($parameter);
		unset($_POST);

	}

}
/*************declaration starts here************/

?>
<!DOCTYPE html>
<html class="no-js" lang="en-US">

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
	<title>
		<?php echo $formname; ?>
	</title>

	<link rel="stylesheet" href="../assets/style.min.css?ver23asas">
	<link rel="stylesheet" href="../assets/css/font-awesome.min.css">
	<link rel="stylesheet" href="../assets/css/media.min.css?ver24as">
	<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.13/css/all.css">

	<link rel="stylesheet" href="../assets/css/proweaverPhone.css?ver=<?php echo time(); ?>">
	<link rel="stylesheet" href="../assets/css/flag.min.css" type="text/css" />

	<script src='https://www.google.com/recaptcha/api.js'></script>
</head>

<body>
	<div class="clearfix">
		<div class="wrapper">
			<div id="contact_us_form_1" class="template_form">
				<div class="form_frame_b">
					<div class="form_content">
						<?php if ($testform): ?>
							<div class="test-mode"><i class="fas fa-info-circle"></i><span>You are in test mode!</span>
							</div>
						<?php endif; ?>

						<form id="submitform" name="contact" method="post" enctype="multipart/form-data" action="">
							<?php echo $prompt_message; ?>

							<!-- INSERT CODE HERE -->

                            <div class="form-check mb-3 mt-3">
                        <input type="checkbox" class="form-check-input" id="Privacy_Policy" name="Privacy_Policy" required>
                        <label class="form-check-label" for="Privacy_Policy">I consent to the collection, use, storage, and processing of my personal and, where applicable, health-related information, including any data I submit on behalf of others, for the purpose of evaluating or fulfilling my request made through this form. I understand this will be handled in accordance with the <a href="/privacy-notice" target="_blank">Privacy Notice</a>.</label>
                    </div>

							<div class="form_box5 secode_box">
								<div class="group">
									<div class="inner_form_box1 recapBtn">
										<div class="g-recaptcha" data-sitekey="<?php echo $recaptcha_sitekey; ?>"></div>
										<div class="btn-submit"><input type="submit" class="form_button"
												value="SUBMIT" /></div>
									</div>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	</div>
	<?php $input->phone(true); ?>
	<script src="../assets/js/jquery-1.9.0.min.js"></script>
	<script type="text/javascript" src="../assets/js/jquery.validate.min.js"></script>
	<script src="../assets/js/plugins.min.js"></script>
	<script src="../assets/js/jquery.mask.min.js"></script>
	<script src="../assets/js/proweaverPhone.js"></script>


	<script type="text/javascript">
		$(document).ready(function () {
			// validate signup form on keyup and submit
			// INSERT FORM VALIDATION CODE HERE


			$("#submitform").submit(function () {
				if ($(this).valid()) {
					$('.load_holder').css('display', 'block');
					self.parent.$('html, body').animate(
						{ scrollTop: self.parent.$('#myframe').offset().top },
						500
					);
				}
				if (grecaptcha.getResponse() == "") {
					var $recaptcha = document.querySelector('#g-recaptcha-response');
					$recaptcha.setAttribute("required", "required");
					$('.g-recaptcha').addClass('errors').attr('id', 'recaptcha');
				}
			});

			$("input").keypress(function (event) {
				if (grecaptcha.getResponse() == "") {
					var $recaptcha = document.querySelector('#g-recaptcha-response');
					$recaptcha.setAttribute("required", "required");
				}
			});

			<!-- CHECKBOX_VALUES_LINES -->
             function checkboxValues(inputAttrName) {
             var inputAttrName = inputAttrName;
             var inputHidden = $('input[name="'+inputAttrName+'"]').attr('value');
             var checkedValues = '';
             var checkboxClass = $('input.'+inputAttrName+'');

             $.each(checkboxClass, function(index) {
               $(this).on('change', function() {
                 var x = $(this).attr('value') + ', ';
                 if($(this).is(':checked')) {
                   inputHidden += x;
                   checkedValues = inputHidden.replace(/,\s*$/, "");
                   $('input[name="'+inputAttrName+'"]').attr('value', checkedValues);
                 } else {
                   inputHidden = inputHidden.replace(x, '');
                   checkedValues = inputHidden.replace(/,\s*$/, "");
                   $('input[name="'+inputAttrName+'"]').attr('value', checkedValues);
                 }
               });
             });
           }

			$('.Date').datepicker();
			$('.Date').attr('autocomplete', 'off');

			<!-- INSERT HIDE/SHOW FUNCTIONALITY HERE -->

		});

		$(function () {
			$('.Date, .date').datepicker({
				autoHide: true,
				zIndex: 2048,
			});

			$('.clockpicker').clockpicker()
				.find('input').change(function () {
					console.log(this.value);
				});
		});

		function isNumberKey(evt) {
			var charCode = (evt.which) ? evt.which : event.keyCode
			if (charCode > 31 && (charCode < 48 || charCode > 57))
				return false;

			return true;
		}
	</script>
</body>

</html>
`